import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { PluginOption } from 'vite'

import type { ResolvedTheme, SiteConfig } from './types'
import { wrapPage } from './utils/wrapPage.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')

const SVELTEKIT_DEFAULT_LAYOUT_RE = /@sveltejs\/kit\/src\/runtime\/components\/layout\.svelte$/

// Custom root layout
const ROOT_LAYOUT_RE = /src\/routes\/\+layout\.(svelte)|(md)$/

// virtual modules
const SVELTEPRESS_SITE_CONFIG_MODULE = 'virtual:sveltepress/site'

// only the src/routes/**/*.+page.(svelte|md) will need to be wrapped by PageLayout
export const PAGE_RE = /\/src\/routes\/[ \(\)\w+\/-]*\+page(@\w+)?\.(svelte|md)$/

if (!existsSync(BASE_PATH))
  mkdirSync(BASE_PATH, { recursive: true })

const sveltepress: (options: {
  theme?: ResolvedTheme
  siteConfig: Required<SiteConfig>
}) => PluginOption = ({
  theme,
  siteConfig,
}) => {
  return {
    name: '@svelte-press/vite',
    /**
     * Must enable this because vite-plugin-svelte enabled this too
     * @see https://github.com/sveltejs/vite-plugin-svelte/blob/1cef575c8f9188456934e38dad7a869b43fe7d46/packages/vite-plugin-svelte/src/index.ts#L58
     */
    enforce: 'pre',
    async buildStart() {
    },
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
      if (PAGE_RE.test(id)) {
        return (await wrapPage({
          mdOrSvelteCode: src,
          siteConfig,
          ...theme,
          id,
          layout: theme?.pageLayout,
        })).wrappedCode
      }

      if (SVELTEKIT_DEFAULT_LAYOUT_RE.test(id) || ROOT_LAYOUT_RE.test(id)) {
        return (await wrapPage({
          id,
          ...theme,
          siteConfig,
          mdOrSvelteCode: src,
          layout: theme?.globalLayout,
        })).wrappedCode
      }

      return {
        code: src,
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      if (PAGE_RE.test(file)) {
        const src = await ctx.read()
        // overwrite read() to return content parsed by mdsvex so that sveltekit can handle the HMR
        ctx.read = async () => (await wrapPage({
          id: file,
          mdOrSvelteCode: src,
          siteConfig,
          ...theme,
          layout: theme?.pageLayout,
        })).wrappedCode
      }

      if (SVELTEKIT_DEFAULT_LAYOUT_RE.test(file) || ROOT_LAYOUT_RE.test(file)) {
        const src = await ctx.read()
        return (await wrapPage({
          id: file,
          ...theme,
          siteConfig,
          mdOrSvelteCode: src,
          layout: theme?.globalLayout,
        })).wrappedCode
      }
    },
  }
}

export default sveltepress
