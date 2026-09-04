import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'
import type { RehypePluginsOrderer, RemarkPluginsOrderer, SveltepressVitePluginOptions } from './types.js'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, statSync, writeFileSync } from 'node:fs'

import { basename, dirname, extname, join, resolve } from 'node:path'
import process from 'node:process'
import { generateLlmsTxt, generateLlmsTxtForLocales } from './llms.js'
import { resolveLocalesConfig } from './locale-scan.js'
import { generateLocaleVersionSitemap } from './sitemap.js'
import { wrapPage } from './utils/wrap-page.js'
import {
  compilePageArtifactModule,
  createArtifactPageWrapper,
  generateVersionShellRoutes,
  generateVersionSitemap,
  loadVersionManifest,
  localeVersionManifestName,
  PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX,
  PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX,
  PAGE_ARTIFACT_VIRTUAL_PREFIX,
  readDraftVersionArtifactManifest,
  readPageArtifactMetadata,
  readPageArtifactModule,
  readVersionArtifactManifest,
  routeFromPageFilename,
  validateStoredPageArtifact,
} from './versioning/index.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')

// virtual modules
const SVELTEPRESS_SITE_CONFIG_MODULE = 'virtual:sveltepress/site'
const SVELTEPRESS_VERSIONS_MODULE = 'virtual:sveltepress/versions'
const SVELTEPRESS_LOCALE_MODULE = 'virtual:sveltepress/locale'
const PAGE_ARTIFACT_TEXT_EXTENSIONS = new Set([
  '',
  '.cjs',
  '.css',
  '.cts',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.less',
  '.md',
  '.mjs',
  '.mts',
  '.pcss',
  '.postcss',
  '.sass',
  '.scss',
  '.svelte',
  '.ts',
  '.tsx',
])

// only the src/routes/**/*.+(page|layout).(svelte|md) will need to be wrapped by theme.pageLayout
// eslint-disable-next-line regexp/strict
export const PAGE_OR_LAYOUT_RE = /\/src\/routes(\/[()[\].\w- ]+)*\/\+(?:page|layout)(@[\w-]*)?\.(?:svelte|md)$/

if (!existsSync(BASE_PATH))
  mkdirSync(BASE_PATH, { recursive: true })

/** Dev-mounted historical version route roots, cleaned on server shutdown. */
let devMountedVersionShells: Array<{ path: string }> = []

/** Base route directories created for dev mounts (e.g. src/routes/v). */
let devMountedBaseRoots: string[] = []

/**
 * In development, mount each locale's historical version shell routes under
 * `src/routes/<basePath>/<versionId>/...` so `/v/2026-08-28/whats-new/` and
 * friends are reachable from the dev server. Production composes these routes
 * during `sveltepress versions build`; the dev server has no build step, so
 * the plugin mounts them on server start and removes them on shutdown.
 */
async function mountDevVersionShellRoutes(input: {
  siteRoot: string
  versionManifest: import('./versioning/index.js').VersionManifest | null
  localeManifests: Record<string, import('./versioning/index.js').VersionManifest | null> | null
  theme?: import('./types.js').ResolvedTheme
}): Promise<void> {
  const { siteRoot, versionManifest, localeManifests, theme } = input
  const mounted: Array<{ path: string, store: string | undefined, siteId: string | undefined }> = []
  // The default (non-locale) manifest plus every locale manifest.
  const manifests: Record<string, import('./versioning/index.js').VersionManifest> = {}
  if (versionManifest)
    manifests['/'] = versionManifest
  if (localeManifests) {
    for (const [prefix, manifest] of Object.entries(localeManifests)) {
      if (manifest)
        manifests[prefix] = manifest
    }
  }
  if (Object.keys(manifests).length === 0 || !theme?.pageLayout)
    return
  try {
    for (const [, manifest] of Object.entries(manifests)) {
      if (!manifest?.artifacts || manifest.artifacts.mode !== 'incremental')
        continue
      const storeRoot = resolve(siteRoot, manifest.artifacts.store ?? '.sveltepress/version-artifacts')
      const siteId = manifest.artifacts.siteId
      const draft = readDraftVersionArtifactManifest(storeRoot, siteId)
      if (!draft)
        continue
      const historical = manifest.versions
        .map(version => readVersionArtifactManifest(storeRoot, siteId, version.id))
        .filter((value): value is NonNullable<typeof value> => value !== null)
      if (historical.length === 0)
        continue
      const baseSegments = manifest.basePath.split('/').filter(Boolean)
      const baseRoot = join(siteRoot, 'src/routes', ...baseSegments)
      const routesDirectory = join(BASE_PATH, `version-shell-routes-dev-${siteId}`)
      await generateVersionShellRoutes({
        siteRoot,
        storeRoot,
        outputDirectory: routesDirectory,
        basePath: manifest.basePath,
        pageLayout: theme.pageLayout,
        current: draft,
        historical,
      })
      for (const version of historical) {
        const generatedVersionRoot = join(routesDirectory, ...baseSegments, version.versionId)
        const mountedVersionRoot = join(baseRoot, version.versionId)
        if (!existsSync(generatedVersionRoot))
          continue
        // Only remove a previous dev mount (identified by its marker); a
        // real user directory at the same path must never be deleted.
        if (existsSync(mountedVersionRoot) && existsSync(join(mountedVersionRoot, '.sveltepress-dev-shell.json'))) {
          rmSync(mountedVersionRoot, { recursive: true, force: true })
        }
        if (existsSync(mountedVersionRoot)) {
          continue
        }
        mkdirSync(dirname(mountedVersionRoot), { recursive: true })
        renameSync(generatedVersionRoot, mountedVersionRoot)
        writeFileSync(join(mountedVersionRoot, '.sveltepress-dev-shell.json'), `${JSON.stringify({ siteId, versionId: version.versionId })}\n`)
        mounted.push({ path: mountedVersionRoot, store: storeRoot, siteId })
      }
      if (mounted.some(mount => mount.path.startsWith(baseRoot)))
        devMountedBaseRoots.push(baseRoot)
      rmSync(routesDirectory, { recursive: true, force: true })
    }
    if (mounted.length > 0) {
      const locale = mounted[0]
      if (locale.store)
        process.env.SVELTEPRESS_ARTIFACT_STORE = locale.store
      if (locale.siteId)
        process.env.SVELTEPRESS_ARTIFACT_SITE_ID = locale.siteId
      devMountedVersionShells = mounted.map(({ path }) => ({ path }))
    }
  }
  catch (error) {
    // Historical routes are a dev convenience; a failure to mount must not
    // prevent the dev server from starting.
    console.warn(`[sveltepress:versions] Skipped mounting historical version routes in dev: ${(error as Error).message}`)
  }
}

/**
 * Remove dev-mounted historical version shells that a hard-killed dev server
 * left behind. Marker-scoped: only directories carrying the
 * `.sveltepress-dev-shell.json` marker are removed, so a real user directory
 * at the same path is never touched. Called on every config resolution —
 * including sync-only resolutions (`svelte-kit sync`, `svelte-check`) that
 * never start a server — so warm caches cannot leak shell routes into
 * typechecking or builds.
 */
function removeResidualDevShells(siteRoot: string): void {
  const routesRoot = join(siteRoot, 'src/routes')
  if (!existsSync(routesRoot))
    return
  const removedRoots: string[] = []
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (!statSync(full).isDirectory())
        continue
      if (existsSync(join(full, '.sveltepress-dev-shell.json'))) {
        rmSync(full, { recursive: true, force: true })
        removedRoots.push(full)
      }
      else {
        visit(full)
      }
    }
  }
  visit(routesRoot)
  // Remove the now-empty base directories the shells lived in (e.g.
  // src/routes/v). rmdirSync only succeeds on empty directories, so a
  // directory with real content is never touched.
  for (const root of removedRoots) {
    let parent = dirname(root)
    while (parent.startsWith(routesRoot) && parent !== routesRoot) {
      try {
        rmdirSync(parent)
        parent = dirname(parent)
      }
      catch {
        break
      }
    }
  }
}

const sveltepress: (options: SveltepressVitePluginOptions) => PluginOption = ({
  theme,
  siteConfig,
  rehypePlugins,
  remarkPlugins,
  llms,
  versions,
  locales,
}) => {
  const siteRoot = process.cwd()
  const manifestFile = versions?.manifest
  const resolvedLocalesEarly = locales && Object.keys(locales).length > 0
    ? locales
    : null
  const defaultExcludeDirs = resolvedLocalesEarly
    ? Object.keys(resolvedLocalesEarly)
        .filter(prefix => prefix !== '/')
        .map(prefix => prefix.replace(/^\/+|\/+$/g, ''))
    : []
  let versionManifest = versions === false
    ? null
    : loadVersionManifest(siteRoot, manifestFile, { excludeDirs: defaultExcludeDirs })
  const resolvedLocales = locales && Object.keys(locales).length > 0
    ? resolveLocalesConfig(locales, siteRoot, versionManifest?.basePath)
    : null
  const localeManifests = resolvedLocales
    ? Object.fromEntries(
        Object.keys(resolvedLocales).map((prefix) => {
          const localeDir = prefix === '/' ? undefined : prefix.replace(/^\/+|\/+$/g, '')
          return [
            prefix,
            loadVersionManifest(siteRoot, localeVersionManifestName(prefix, manifestFile), {
              localeDir,
              excludeDirs: Object.keys(resolvedLocales)
                .filter(other => other !== prefix && other !== '/')
                .map(other => other.replace(/^\/+|\/+$/g, '')),
            }),
          ]
        }),
      )
    : null
  const allRemarkPlugins: Plugin[] = []
  const allRehypePlugins: Plugin[] = []

  if (Array.isArray(remarkPlugins)) {
    if (theme?.remarkPlugins) {
      allRemarkPlugins.push(...theme.remarkPlugins)
    }
    allRemarkPlugins.push(...remarkPlugins)
  }
  else if (isRemarkPluginsOrderer(remarkPlugins)) {
    allRemarkPlugins.push(...remarkPlugins?.(theme?.remarkPlugins || []) ?? [])
  }
  else {
    if (theme?.remarkPlugins) {
      allRemarkPlugins.push(...theme.remarkPlugins)
    }
  }

  if (Array.isArray(rehypePlugins)) {
    if (theme?.rehypePlugins)
      allRehypePlugins.push(...theme.rehypePlugins)
    if (rehypePlugins)
      allRehypePlugins.push(...rehypePlugins)
  }
  else if (isRehypePluginsOrderer(rehypePlugins)) {
    allRehypePlugins.push(...rehypePlugins?.(theme?.rehypePlugins || []) ?? [])
  }
  else {
    if (theme?.rehypePlugins)
      allRehypePlugins.push(...theme.rehypePlugins)
  }

  function getLayout(path: string) {
    let layout: string | undefined
    if (isRootLayout(path))
      layout = theme?.globalLayout
    else if (isPage(path))
      layout = theme?.pageLayout
    return layout
  }

  const getWrappedCode = async (id: string, src: string) => (await wrapPage({
    id,
    mdOrSvelteCode: src,
    ...theme,
    remarkPlugins: allRemarkPlugins,
    rehypePlugins: allRehypePlugins,
    layout: getLayout(id),
  })).wrappedCode

  let isBuild = false
  let isDev = false

  return {
    name: '@sveltepress/vite',
    api: {
      sveltepress: {
        async compilePageArtifact(filename: string, source: string, options?: { routesDirectory?: string, siteRoot?: string }) {
          return compilePageArtifactModule({
            filename,
            source,
            routesDirectory: options?.routesDirectory,
            siteRoot: options?.siteRoot ?? siteRoot,
            highlighter: theme?.highlighter,
            remarkPlugins: allRemarkPlugins,
            rehypePlugins: allRehypePlugins,
            footnoteLabel: theme?.footnoteLabel,
          })
        },
        pageLayout: theme?.pageLayout,
      },
    },
    /**
     * Must enable this because vite-plugin-svelte enabled this too
     * @see https://github.com/sveltejs/vite-plugin-svelte/blob/1cef575c8f9188456934e38dad7a869b43fe7d46/packages/vite-plugin-svelte/src/index.ts#L58
     */
    enforce: 'pre',
    async configResolved(config) {
      isBuild = config.command === 'build' && !config.build.ssr
      isDev = config.command === 'serve'
      assertSingleSvelteKit(config.plugins)
      devMountedVersionShells = []
      devMountedBaseRoots = []
      // Never mount here. `config.command === 'serve'` also matches sync-only
      // resolutions — `svelte-kit sync` and `svelte-check` resolve the Vite
      // config as a dev server to read plugin options but never start one and
      // have no shutdown lifecycle, so mounting here leaks shell routes onto
      // warm caches. A real dev server mounts in `configureServer`.
      removeResidualDevShells(siteRoot)
    },
    config: () => ({
      define: {
        'import.meta.env.SVELTEPRESS_VERSION_BASE': JSON.stringify(versionManifest?.basePath ?? ''),
      },
      server: {
        fs: {
          allow: ['.sveltepress'],
        },
      },
      resolve: {
        alias: {
          $sveltepress: resolve(process.cwd(), '.sveltepress'),
        },
      },
    }),
    configureServer(server) {
      if (versionManifest)
        server.watcher.add(resolve(siteRoot, manifestFile ?? 'sveltepress.versions.json'))
      // A real dev server lifecycle reaches configureServer; sync-only Vite
      // resolutions do not. Mount historical version shells here so the dev
      // server can serve /v/<id>/... routes without leaking them into
      // svelte-check typechecking.
      return mountDevVersionShellRoutes({ siteRoot, versionManifest, localeManifests, theme })
    },
    async closeBundle() {
      // Vite calls closeBundle on `server.close()` (graceful shutdown) and
      // after a build, so this removes dev-mounted historical route shells
      // without relying on httpServer 'close' timing.
      for (const mount of devMountedVersionShells)
        rmSync(mount.path, { recursive: true, force: true })
      devMountedVersionShells = []
      // Remove the empty base directories the mount created. rmdirSync only
      // succeeds on empty directories, so a user directory with real content
      // at the same path is never touched.
      for (const baseRoot of devMountedBaseRoots) {
        try {
          rmdirSync(baseRoot)
        }
        catch {
          // Non-empty: leave it.
        }
      }
      devMountedBaseRoots = []
    },
    async resolveId(id, importer) {
      if (id.startsWith(PAGE_ARTIFACT_VIRTUAL_PREFIX))
        return `\0${id}/entry.js`
      if (importer?.startsWith(`\0${PAGE_ARTIFACT_VIRTUAL_PREFIX}`)
        || importer?.startsWith(`\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}`)
        || importer?.startsWith(`\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}`)) {
        const resolved = await resolvePageArtifactDependency(id, importer)
        if (resolved)
          return resolved
      }
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return SVELTEPRESS_SITE_CONFIG_MODULE
      if (id === SVELTEPRESS_VERSIONS_MODULE)
        return SVELTEPRESS_VERSIONS_MODULE
      if (id === SVELTEPRESS_LOCALE_MODULE)
        return SVELTEPRESS_LOCALE_MODULE
      return null
    },
    async load(id, options) {
      if (id.startsWith(`\0${PAGE_ARTIFACT_VIRTUAL_PREFIX}`)) {
        const artifactHash = id.slice(`\0${PAGE_ARTIFACT_VIRTUAL_PREFIX}`.length).split('/', 1)[0]
        const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
        if (!storeRoot)
          throw new Error('[sveltepress:versions] SVELTEPRESS_ARTIFACT_STORE is required to load page artifacts.')
        return readPageArtifactModule(storeRoot, artifactHash, options?.ssr ? 'server' : 'client')
      }
      if (id.startsWith(`\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}`)) {
        const value = id.slice(`\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}`.length)
        if (value.includes('?'))
          return null
        const slash = value.indexOf('/')
        const artifactHash = value.slice(0, slash)
        const sourcePath = value.slice(slash + 1)
        const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
        if (!storeRoot)
          throw new Error('[sveltepress:versions] SVELTEPRESS_ARTIFACT_STORE is required to load page artifact sources.')
        const descriptor = await validateStoredPageArtifact(storeRoot, artifactHash)
        const artifactPath = `sources/${sourcePath}`
        if (!descriptor.files.some(file => file.path === artifactPath))
          throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} has no source file ${sourcePath}.`)
        return loadPageArtifactFile(artifactPath, storeRoot, artifactHash, file => this.emitFile(file))
      }
      if (id.startsWith(`\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}`)) {
        const value = id.slice(`\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}`.length)
        if (value.includes('?'))
          return null
        const slash = value.indexOf('/')
        const artifactHash = value.slice(0, slash)
        const generatedPath = value.slice(slash + 1)
        const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
        if (!storeRoot)
          throw new Error('[sveltepress:versions] SVELTEPRESS_ARTIFACT_STORE is required to load generated page artifact files.')
        const descriptor = await validateStoredPageArtifact(storeRoot, artifactHash)
        const artifactPath = `generated/${generatedPath}`
        if (!descriptor.files.some(file => file.path === artifactPath))
          throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} has no generated file ${generatedPath}.`)
        return loadPageArtifactFile(artifactPath, storeRoot, artifactHash, file => this.emitFile(file))
      }
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return `export default ${JSON.stringify(siteConfig)}`
      if (id === SVELTEPRESS_VERSIONS_MODULE) {
        if (localeManifests && Object.values(localeManifests).some(Boolean)) {
          return `
            import { createLocaleVersionRuntime } from '@sveltepress/vite/versioning/runtime'
            import { resolveLocale as resolveLocaleHelper } from 'virtual:sveltepress/locale'
            export const manifest = ${JSON.stringify(localeManifests['/'] ?? null)}
            export const manifests = ${JSON.stringify(localeManifests)}
            const runtime = createLocaleVersionRuntime(manifests, pathname => {
              const locale = resolveLocaleHelper(pathname)
              return locale ? locale.prefix : null
            })
            export const changeSets = runtime.changeSets
            export const resolveVersionChanges = runtime.resolveVersionChanges
            export const resolveVersionContext = runtime.resolveVersionContext
            export const resolveVersionedPath = runtime.resolveVersionedPath
            export const resolveVersionSwitch = runtime.resolveVersionSwitch
            export const resolveVersionManifest = runtime.resolveVersionManifest
            export default runtime
          `
        }
        if (!versionManifest) {
          return `
            export const manifest = null
            export const manifests = { '/': null }
            export const resolveVersionManifest = () => null
            export const changeSets = {}
            export const resolveVersionChanges = () => null
            export const resolveVersionContext = () => null
            export const resolveVersionedPath = value => value
            export const resolveVersionSwitch = () => null
            export default { manifest, manifests, resolveVersionManifest, changeSets, resolveVersionChanges, resolveVersionContext, resolveVersionedPath, resolveVersionSwitch }
          `
        }
        return `
          import { createVersionRuntime } from '@sveltepress/vite/versioning/runtime'
          export const manifest = ${JSON.stringify(versionManifest)}
          export const manifests = { '/': manifest }
          export const resolveVersionManifest = () => manifest
          const runtime = createVersionRuntime(manifest)
          export const changeSets = runtime.changeSets
          export const resolveVersionChanges = runtime.resolveVersionChanges
          export const resolveVersionContext = runtime.resolveVersionContext
          export const resolveVersionedPath = runtime.resolveVersionedPath
          export const resolveVersionSwitch = runtime.resolveVersionSwitch
          export default runtime
        `
      }
      if (id === SVELTEPRESS_LOCALE_MODULE) {
        if (!resolvedLocales) {
          return `
            export const locales = null
            export const resolveLocale = () => null
            export const resolveLocalizedPath = value => value
            export const resolveLocaleSwitch = () => null
            export default { locales, resolveLocale, resolveLocalizedPath, resolveLocaleSwitch }
          `
        }
        return `
          import { base as appBase } from '$app/paths'
          import {
            resolveLocale as resolveLocaleHelper,
            resolveLocalizedPath as resolveLocalizedPathHelper,
            resolveLocaleSwitch as resolveLocaleSwitchHelper,
          } from '@sveltepress/vite/locale'
          export const locales = ${JSON.stringify(resolvedLocales)}
          export const resolveLocale = (pathname, base = appBase) => resolveLocaleHelper(pathname, locales, base)
          export const resolveLocalizedPath = (to, locale, base = appBase) => resolveLocalizedPathHelper(to, locale, locales, base)
          export const resolveLocaleSwitch = (pathname, targetPrefix, base = appBase) => resolveLocaleSwitchHelper(pathname, targetPrefix, locales, base)
          export default { locales, resolveLocale, resolveLocalizedPath, resolveLocaleSwitch }
        `
      }
    },
    async transform(src, id) {
      if (PAGE_OR_LAYOUT_RE.test(id)) {
        if (src.includes('<!-- sveltepress:artifact-shell -->'))
          return src
        const artifactWrapper = await resolveCurrentArtifactWrapper(id)
        if (artifactWrapper)
          return artifactWrapper
        const code = await getWrappedCode(id, src)
        return code
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      const manifestPath = resolve(siteRoot, manifestFile ?? 'sveltepress.versions.json')
      const localeManifestPaths = localeManifests
        ? Object.keys(localeManifests).map(prefix => resolve(siteRoot, localeVersionManifestName(prefix, manifestFile)))
        : []
      const versionSourceChanged = (Boolean(versionManifest) || localeManifests) && (
        PAGE_OR_LAYOUT_RE.test(file) || file === manifestPath || localeManifestPaths.includes(file)
      )
      if (versionSourceChanged) {
        versionManifest = loadVersionManifest(siteRoot, manifestFile, {
          excludeDirs: Object.keys(resolvedLocales ?? {})
            .filter(other => other !== '/')
            .map(other => other.replace(/^\/+|\/+$/g, '')),
        })
        if (localeManifests) {
          for (const prefix of Object.keys(localeManifests)) {
            const localeDir = prefix === '/' ? undefined : prefix.replace(/^\/+|\/+$/g, '')
            localeManifests[prefix] = loadVersionManifest(siteRoot, localeVersionManifestName(prefix, manifestFile), {
              localeDir,
              excludeDirs: Object.keys(resolvedLocales ?? {})
                .filter(other => other !== prefix && other !== '/')
                .map(other => other.replace(/^\/+|\/+$/g, '')),
            })
          }
        }
        const virtualModule = ctx.server.moduleGraph.getModuleById(SVELTEPRESS_VERSIONS_MODULE)
        if (virtualModule)
          ctx.server.moduleGraph.invalidateModule(virtualModule)
        ctx.server.ws.send({ type: 'full-reload' })
      }
      if (PAGE_OR_LAYOUT_RE.test(file)) {
        const src = await ctx.read()
        // overwrite read() to return content parsed by md-to-svelte so that sveltekit can handle the HMR
        ctx.read = async () => await getWrappedCode(file, src)
      }
    },
    writeBundle(outputOptions) {
      const bundleDirectory = outputOptions.dir ? resolve(siteRoot, outputOptions.dir) : null
      if (isBuild && llms?.enabled) {
        if (resolvedLocales) {
          generateLlmsTxtForLocales(llms, siteConfig ?? {}, resolvedLocales, localeManifests)
          if (bundleDirectory)
            generateLlmsTxtForLocales(llms, siteConfig ?? {}, resolvedLocales, localeManifests, siteRoot, bundleDirectory)
        }
        else {
          generateLlmsTxt(llms, siteConfig ?? {}, versionManifest)
          if (bundleDirectory)
            generateLlmsTxt(llms, siteConfig ?? {}, versionManifest, siteRoot, bundleDirectory)
        }
      }
      if (isBuild && resolvedLocales) {
        // One combined sitemap: current locale routes with hreflang plus
        // every eligible historical version route per locale manifest.
        const combinedManifests: Record<string, import('./versioning/index.js').VersionManifest | null> = {}
        if (versionManifest)
          combinedManifests['/'] = versionManifest
        for (const [prefix, manifest] of Object.entries(localeManifests ?? {})) {
          if (manifest)
            combinedManifests[prefix] = manifest
        }
        generateLocaleVersionSitemap(resolvedLocales, combinedManifests, process.cwd(), llms?.baseUrl)
        if (bundleDirectory)
          generateLocaleVersionSitemap(resolvedLocales, combinedManifests, siteRoot, llms?.baseUrl, bundleDirectory)
      }
      else if (isBuild && versionManifest) {
        generateVersionSitemap(versionManifest, process.cwd(), llms?.baseUrl)
        if (bundleDirectory)
          generateVersionSitemap(versionManifest, siteRoot, llms?.baseUrl, bundleDirectory)
      }
    },
  }

  function loadPageArtifactFile(
    artifactPath: string,
    storeRoot: string,
    artifactHash: string,
    emitAsset: (file: { type: 'asset', name: string, source: Uint8Array }) => string,
  ): string {
    const filePath = resolve(storeRoot, 'blobs', artifactHash, artifactPath)
    if (PAGE_ARTIFACT_TEXT_EXTENSIONS.has(extname(artifactPath).toLowerCase()))
      return readFileSync(filePath, 'utf8')
    const referenceId = emitAsset({
      type: 'asset',
      name: basename(artifactPath),
      source: readFileSync(filePath),
    })
    return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`
  }

  async function resolvePageArtifactDependency(source: string, importer: string): Promise<string | null> {
    const importerPrefixes = [
      `\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}`,
      `\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}`,
      `\0${PAGE_ARTIFACT_VIRTUAL_PREFIX}`,
    ]
    const prefix = importerPrefixes.find(value => importer.startsWith(value))
    if (!prefix)
      return null
    const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
    if (!storeRoot)
      throw new Error('[sveltepress:versions] SVELTEPRESS_ARTIFACT_STORE is required to resolve page artifact dependencies.')
    const value = importer.slice(prefix.length)
    const slash = value.indexOf('/')
    const artifactHash = value.slice(0, slash)
    const descriptor = await validateStoredPageArtifact(storeRoot, artifactHash)
    if (source.startsWith(PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX)) {
      const generatedPath = source.slice(PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX.length)
      const artifactPath = `generated/${generatedPath}`
      return descriptor.files.some(file => file.path === artifactPath)
        ? `\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}${artifactHash}/${generatedPath}`
        : null
    }
    if (!source.startsWith('.') && !source.startsWith('$lib/'))
      return null
    const metadata = await readPageArtifactMetadata(storeRoot, artifactHash)
    const importerSource = prefix === `\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}`
      ? value.slice(slash + 1)
      : metadata.sourceFile
    const requested = source.startsWith('$lib/')
      ? `src/lib/${source.slice('$lib/'.length)}`
      : resolve(dirname(`/${importerSource}`), source).slice(1)
    const candidates = [
      requested,
      ...['.svelte', '.ts', '.js', '.mjs', '.cjs', '.css', '.json'].map(extension => `${requested}${extension}`),
      ...['.svelte', '.ts', '.js', '.mjs', '.cjs', '.css', '.json'].map(extension => `${requested}/index${extension}`),
    ]
    const match = candidates.find(candidate => descriptor.files.some(file => file.path === `sources/${candidate}`))
    return match ? `\0${PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX}${artifactHash}/${match}` : null
  }

  async function resolveCurrentArtifactWrapper(id: string): Promise<string | null> {
    if (!isPage(id))
      return null
    if (isDev)
      return null
    const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
    const siteId = process.env.SVELTEPRESS_ARTIFACT_SITE_ID
    if (!storeRoot || !siteId)
      return null
    if (!theme?.pageLayout)
      throw new Error('[sveltepress:versions] The configured theme must expose pageLayout to compose page artifacts.')
    const draft = readDraftVersionArtifactManifest(storeRoot, siteId)
    if (!draft)
      throw new Error(`[sveltepress:versions] Missing artifact draft for site ${siteId}.`)
    const route = routeFromPageFilename(id)
    const page = draft.pages[route]
    // On a multi-locale build the draft covers only the active locale's
    // current pages; sibling-locale pages render live.
    if (!page)
      return null
    const metadata = await readPageArtifactMetadata(storeRoot, page.artifactHash)
    return createArtifactPageWrapper({
      artifactHash: page.artifactHash,
      fm: metadata.fm,
      pageLayout: theme.pageLayout,
    })
  }
}

/**
 * `sveltepress()` sets up SvelteKit (and therefore vite-plugin-svelte)
 * internally. If the user also keeps a standalone `sveltekit()` plugin — which
 * is easy to do on the newer layout where `sveltekit()` carries the inline
 * config — every svelte file gets compiled twice and the build crashes with a
 * cryptic "Expected token }". `vite-plugin-svelte` registers exactly one plugin
 * named `vite-plugin-svelte` per instance (a marker meant for exactly this kind
 * of detection), so more than one means a duplicate SvelteKit setup.
 */
export function assertSingleSvelteKit(plugins: ReadonlyArray<{ name?: string }>) {
  const svelteInstanceCount = plugins.filter(p => p?.name === 'vite-plugin-svelte').length
  if (svelteInstanceCount > 1) {
    throw new Error(
      '[@sveltepress/vite] Detected more than one SvelteKit (vite-plugin-svelte) instance in your vite config.\n'
      + '`sveltepress()` already sets up SvelteKit for you, so you must remove the standalone `sveltekit()` plugin from `plugins`.\n'
      + 'To pass SvelteKit options such as `compilerOptions` or `adapter`, forward them through `sveltepress({ svelteKitOptions: { ... } })` instead.',
    )
  }
}

function isPage(path: string) {
  return path.endsWith('+page.svelte') || path.endsWith('+page.md')
}

function isRootLayout(path: string) {
  return path.endsWith('src/routes/+layout.svelte') || path.endsWith('src/routes/+layout.md')
}

function isRemarkPluginsOrderer(value: any): value is RemarkPluginsOrderer {
  return typeof value === 'function'
}

function isRehypePluginsOrderer(value: any): value is RehypePluginsOrderer {
  return typeof value === 'function'
}

export default sveltepress
