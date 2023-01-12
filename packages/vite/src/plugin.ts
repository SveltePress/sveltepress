import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import type { PluginOption } from 'vite'

import type { ResolvedTheme, SiteConfig } from './types'
import { getPages } from './utils/pages.js'
import { wrapPage } from './utils/wrapPage.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')

const DEFAULT_ROOT_LAYOUT_PATH = resolve(BASE_PATH, '_Layout.svelte')
const ROOT_LAYOUT_PATH = resolve(process.cwd(), 'src/routes/+layout.svelte')

const ROOT_LAYOUT_RE = /src\/routes\/\+layout\.svelte$/

// virtual modules
const SVELTEPRESS_PAGES_MODULE = 'sveltepress:pages'
const SVELTEPRESS_SITE_CONFIG_MODULE = 'sveltepress:site'

// only the src/routes/**/*.+page.(svelte|md) will need to be wrapped by PageLayout
export const PAGE_RE = /\/src\/routes\/[ \(\)\w+\/-]*\+page(@\w+)?\.(svelte|md)$/

const SVELTEKIT_NODE_0_RE = /\.svelte-kit\/generated\/nodes\/0\.js$/

const contentWithGlobalLayout = (content: string, theme?: ResolvedTheme) => theme
  ? `
<GlobalLayout>
  ${content}
</GlobalLayout>
  `
  : content

const sveltepress: (options: {
  theme?: ResolvedTheme
  siteConfig: Required<SiteConfig>
}) => PluginOption = ({
  theme,
  siteConfig,
}) => {
  const importGlobalLayout = theme
    ? `import GlobalLayout from \'${theme.globalLayout}\'`
    : ''

  const clientImports = theme?.clientImports?.join('\n')

  const defaultLayout = `
<script>
  ${importGlobalLayout}
  ${clientImports}
</script>
${contentWithGlobalLayout('<slot />', theme)}
`

  const defaultWrappedCustomLayout = (customRootLayoutPath: string) => `
<script>
  ${importGlobalLayout}
  import CustomLayout from '${customRootLayoutPath}'
  ${clientImports}
</script>
${contentWithGlobalLayout(`
  <CustomLayout>
    <slot />
  </CustomLayout>`, theme)}
`

  let pages: string[] = []
  return {
    name: 'vite-plugin-sveltepress',
    /**
     * Must enable this because vite-plugin-svelte enabled this too
     * @see https://github.com/sveltejs/vite-plugin-svelte/blob/1cef575c8f9188456934e38dad7a869b43fe7d46/packages/vite-plugin-svelte/src/index.ts#L58
     */
    enforce: 'pre',
    async buildStart() {
      if (!existsSync(BASE_PATH))
        mkdirSync(BASE_PATH, { recursive: true })

      // Provide default layout file when uer doesn't have one
      if (!existsSync(ROOT_LAYOUT_PATH))
        writeFileSync(DEFAULT_ROOT_LAYOUT_PATH, defaultLayout)

      pages = await getPages()
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
      if ([SVELTEPRESS_PAGES_MODULE, SVELTEPRESS_SITE_CONFIG_MODULE].includes(id))
        return id
    },
    load(id) {
      if (id === SVELTEPRESS_PAGES_MODULE)
        return `export default ${JSON.stringify(pages)}`
      if (id === SVELTEPRESS_SITE_CONFIG_MODULE)
        return `export default ${JSON.stringify(siteConfig)}`
    },
    async transform(src, id) {
      if (PAGE_RE.test(id)) {
        return wrapPage({
          mdOrSvelteCode: src,
          siteConfig,
          theme,
          id,
        })
      }

      if (ROOT_LAYOUT_RE.test(id))
        writeFileSync(DEFAULT_ROOT_LAYOUT_PATH, defaultWrappedCustomLayout(id))

      // Hack into the sveltekit generate root layout file
      // TODO: This is a little bit hacky. Maybe there's a better way
      if (SVELTEKIT_NODE_0_RE.test(id)) {
        return `export { default as component } from '$sveltepress/_Layout.svelte'
`
      }

      return {
        code: src,
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      const src = await ctx.read()
      // overwrite read() to return content parsed by mdsvex so that sveltekit can handle the HMR
      ctx.read = () => wrapPage({
        id: file,
        mdOrSvelteCode: src,
        siteConfig,
        theme,
      })
    },
  }
}

export default sveltepress
