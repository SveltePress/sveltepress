import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'
import type { RehypePluginsOrderer, RemarkPluginsOrderer, SveltepressVitePluginOptions } from './types.js'
import { existsSync, mkdirSync } from 'node:fs'

import { resolve } from 'node:path'
import process from 'node:process'
import { generateLlmsTxt } from './llms.js'
import { wrapPage } from './utils/wrap-page.js'
import { generateVersionSitemap, loadVersionManifest } from './versioning/index.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')

// virtual modules
const SVELTEPRESS_SITE_CONFIG_MODULE = 'virtual:sveltepress/site'
const SVELTEPRESS_VERSIONS_MODULE = 'virtual:sveltepress/versions'

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
}) => {
  const siteRoot = process.cwd()
  const manifestFile = versions?.manifest
  let versionManifest = versions === false
    ? null
    : loadVersionManifest(siteRoot, manifestFile)
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
    resolveId(id) {
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return SVELTEPRESS_SITE_CONFIG_MODULE
      if (id === SVELTEPRESS_VERSIONS_MODULE)
        return SVELTEPRESS_VERSIONS_MODULE
    },
    load(id) {
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return `export default ${JSON.stringify(siteConfig)}`
      if (id === SVELTEPRESS_VERSIONS_MODULE) {
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
          import { createVersionRuntime } from '@sveltepress/vite/versioning'
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
    },
    async transform(src, id) {
      if (PAGE_OR_LAYOUT_RE.test(id)) {
        const code = await getWrappedCode(id, src)
        return code
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      const manifestPath = resolve(siteRoot, manifestFile ?? 'sveltepress.versions.json')
      const versionSourceChanged = Boolean(versionManifest) && (
        PAGE_OR_LAYOUT_RE.test(file) || file === manifestPath
      )
      if (versionSourceChanged) {
        versionManifest = loadVersionManifest(siteRoot, manifestFile)
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
    writeBundle() {
      if (isBuild && llms?.enabled) {
        generateLlmsTxt(llms, siteConfig ?? {}, versionManifest)
      }
      if (isBuild && versionManifest)
        generateVersionSitemap(versionManifest, process.cwd(), llms?.baseUrl)
    },
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
