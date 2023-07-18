import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import process from 'node:process'
import type { PluginOption } from 'vite'

import type { Plugin } from 'unified'
import type { SveltepressVitePluginOptions } from './types'
import { wrapPage } from './utils/wrap-page.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')

// virtual modules
const SVELTEPRESS_SITE_CONFIG_MODULE = 'virtual:sveltepress/site'

// only the src/routes/**/*.+(page|layout).(svelte|md) will need to be wrapped by theme.pageLayout
export const PAGE_OR_LAYOUT_RE = /\/src\/routes(\/[\(\)\[\]\w- ]+)*\/\+(?:page|layout)(@[\w-]*)?\.(?:svelte|md)$/

if (!existsSync(BASE_PATH))
  mkdirSync(BASE_PATH, { recursive: true })

const sveltepress: (options: SveltepressVitePluginOptions) => PluginOption = ({
  theme,
  siteConfig,
  rehypePlugins,
  remarkPlugins,
}) => {
  const allRemarkPlugins: Plugin[] = []
  const allRehypePlugins: Plugin[] = []

  if (theme?.remarkPlugins)
    allRemarkPlugins.push(...theme.remarkPlugins)
  if (remarkPlugins)
    allRemarkPlugins.push(...remarkPlugins)
  if (theme?.rehypePlugins)
    allRehypePlugins.push(...theme.rehypePlugins)
  if (rehypePlugins)
    allRehypePlugins.push(...rehypePlugins)

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

  return {
    name: '@sveltepress/vite',
    /**
     * Must enable this because vite-plugin-svelte enabled this too
     * @see https://github.com/sveltejs/vite-plugin-svelte/blob/1cef575c8f9188456934e38dad7a869b43fe7d46/packages/vite-plugin-svelte/src/index.ts#L58
     */
    enforce: 'pre',
    config: () => ({
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
    resolveId(id) {
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return SVELTEPRESS_SITE_CONFIG_MODULE
    },
    load(id) {
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return `export default ${JSON.stringify(siteConfig)}`
    },
    async transform(src, id) {
      if (PAGE_OR_LAYOUT_RE.test(id)) {
        const code = await getWrappedCode(id, src)
        return code
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      if (PAGE_OR_LAYOUT_RE.test(file)) {
        const src = await ctx.read()
        // overwrite read() to return content parsed by md-to-svelte so that sveltekit can handle the HMR
        ctx.read = async () => await getWrappedCode(file, src)
      }
    },
  }
}

function isPage(path: string) {
  return path.endsWith('+page.svelte') || path.endsWith('+page.md')
}

function isRootLayout(path: string) {
  return path.endsWith('src/routes/+layout.svelte') || path.endsWith('src/routes/+layout.md')
}

export default sveltepress
