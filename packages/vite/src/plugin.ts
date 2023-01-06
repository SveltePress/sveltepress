import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import type { PluginOption } from 'vite'
import { ensureFileSync } from 'fs-extra'
import type { ResolvedTheme, SiteConfig } from './types'
import mdToSvelte from './markdown/mdToSvelte.js'
import { getPages } from './utils/sidebar.js'
import { info } from './utils/log.js'

const BASE_PATH = resolve(process.cwd(), '.sveltepress')
const DEFAULT_ROOT_LAYOUT_PATH = resolve(BASE_PATH, '_Layout.svelte')
const ROOT_LAYOUT_PATH = resolve(process.cwd(), 'src/routes/+layout.svelte')
const PAGES_PATH = resolve(BASE_PATH, 'pages')

const ROOT_LAYOUT_RE = /src\/routes\/\+layout\.svelte$/

const SVELTEPRESS_PAGES_MODULE = 'sveltepress:pages'

const MD_PAGE_RE = /\+page\.md$/
const SVELTE_PAGE_RE = /src\/routes\/([a-zA-Z0-1_\+@-]+\/)+\+page\.svelte$/

const SVELTEKIT_NODE_0_RE = /\.svelte-kit\/generated\/nodes\/0\.js$/

const IMPORT_STYLE = `import '@svelte-press/vite/style.css'
  import 'uno.css'`

const wrapPage = (pagePath: string, pageLayout?: string) => pageLayout
  ? `<script>
  import Page from '${pagePath}'
  import PageLayout from '${pageLayout}'
</script>
<PageLayout>
  <Page />
</PageLayout>
`
  : `<script>
  import Page from '${pagePath}'
</script>
  <Page />
`

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

  const defaultLayout = `
<script>
  ${importGlobalLayout}
  ${IMPORT_STYLE}
</script>
${contentWithGlobalLayout('<slot />', theme)}
`

  const defaultWrappedCustomLayout = (customRootLayoutPath: string) => `
<script>
  ${importGlobalLayout}
  import CustomLayout from '${customRootLayoutPath}'
  ${IMPORT_STYLE}
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
      if (!existsSync(PAGES_PATH))
        mkdirSync(PAGES_PATH, { recursive: true })

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
      if (id === SVELTEPRESS_PAGES_MODULE)
        return SVELTEPRESS_PAGES_MODULE
    },
    load(id) {
      if (id === SVELTEPRESS_PAGES_MODULE)
        return `export default ${JSON.stringify(pages)}`
    },
    async transform(src, id) {
      if (MD_PAGE_RE.test(id)) {
        const { code } = await mdToSvelte({
          filename: id,
          mdContent: src,
          siteConfig,
        }) || { code: src }
        const pagePath = resolve(
          PAGES_PATH,
          id.slice(id.indexOf('/routes'))
            .replace(/^\/routes\//, '')
            .replace(/\.md$/, '.svelte'))
        ensureFileSync(pagePath)
        writeFileSync(pagePath, code)

        return wrapPage(pagePath, theme?.pageLayout)
      }

      if (SVELTE_PAGE_RE.test(id)) {
        const pagePath = resolve(
          PAGES_PATH,
          id.slice(id.indexOf('/routes'))
            .replace(/^\/routes\//, ''))
        ensureFileSync(pagePath)
        info('svelte page: ', pagePath)
        writeFileSync(pagePath, src)

        return wrapPage(pagePath, theme?.pageLayout)
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

      // overwrite read() to return content parsed by mdsvex so that sveltekit can handle the HMR
      if (MD_PAGE_RE.test(file)) {
        const mdContent = await ctx.read()
        const { code } = await mdToSvelte({
          mdContent,
          filename: file,
          siteConfig,
        })
        ctx.read = () => code
      }
    },
  }
}

export default sveltepress
