import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'
import type { RehypePluginsOrderer, RemarkPluginsOrderer, SveltepressVitePluginOptions } from './types.js'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'

import { basename, dirname, extname, resolve } from 'node:path'
import process from 'node:process'
import { generateLlmsTxt, generateLlmsTxtForLocales } from './llms.js'
import { resolveLocalesConfig } from './locale.js'
import { generateLocaleSitemap } from './sitemap.js'
import { wrapPage } from './utils/wrap-page.js'
import {
  compilePageArtifactModule,
  createArtifactPageWrapper,
  generateVersionSitemap,
  loadVersionManifest,
  localeVersionManifestName,
  PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX,
  PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX,
  PAGE_ARTIFACT_VIRTUAL_PREFIX,
  readDraftVersionArtifactManifest,
  readPageArtifactMetadata,
  readPageArtifactModule,
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
  let versionManifest = versions === false
    ? null
    : loadVersionManifest(siteRoot, manifestFile)
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
    configResolved(config) {
      isBuild = config.command === 'build' && !config.build.ssr
      assertSingleSvelteKit(config.plugins)
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
            export const changeSets = {}
            export const resolveVersionChanges = () => null
            export const resolveVersionContext = () => null
            export const resolveVersionedPath = value => value
            export const resolveVersionSwitch = () => null
            export default { manifest, changeSets, resolveVersionChanges, resolveVersionContext, resolveVersionedPath, resolveVersionSwitch }
          `
        }
        return `
          import { createVersionRuntime } from '@sveltepress/vite/versioning/runtime'
          export const manifest = ${JSON.stringify(versionManifest)}
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
          import {
            resolveLocale as resolveLocaleHelper,
            resolveLocalizedPath as resolveLocalizedPathHelper,
            resolveLocaleSwitch as resolveLocaleSwitchHelper,
          } from '@sveltepress/vite/locale'
          export const locales = ${JSON.stringify(resolvedLocales)}
          export const resolveLocale = pathname => resolveLocaleHelper(pathname, locales)
          export const resolveLocalizedPath = (to, locale) => resolveLocalizedPathHelper(to, locale, locales)
          export const resolveLocaleSwitch = (pathname, targetPrefix) => resolveLocaleSwitchHelper(pathname, targetPrefix, locales)
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
        versionManifest = loadVersionManifest(siteRoot, manifestFile)
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
        generateLocaleSitemap(resolvedLocales, process.cwd(), llms?.baseUrl)
        if (bundleDirectory)
          generateLocaleSitemap(resolvedLocales, siteRoot, llms?.baseUrl, bundleDirectory)
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
    if (!page)
      throw new Error(`[sveltepress:versions] Artifact draft ${siteId}/${draft.versionId} has no current route ${route}.`)
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
