import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import type { PluginOption } from 'vite'
import type { SveltepressVitePluginOptions } from './types'
import mdToSvelte from './markdown/mdToSvelte.js'
import { info } from './utils/log.js'

const BASE_PATH = resolve(process.cwd(), '.sveltepress')
const DEFAULT_ROOT_LAYOUT_PATH = resolve(BASE_PATH, '_Layout.svelte')
const ROOT_LAYOUT_PATH = resolve(process.cwd(), 'src/routes/+layout.svelte')
const ROOT_LAYOUT_RE = /src\/routes\/\+layout\.svelte$/

const MARKDOWN_FILE_RE = /\.md$/

const AUTO_ADDED_ROOT_LAYOUT_FILE_ID = resolve(process.cwd(), 'src/+layout.server.ts')

const ROOT_SERVER_FILES = [
  AUTO_ADDED_ROOT_LAYOUT_FILE_ID,
  resolve(process.cwd(), 'src/routes/+layout.server.js'),
  resolve(process.cwd(), 'src/routes/+layout.js'),
  resolve(process.cwd(), 'src/routes/+layout.ts'),
]

const SVELTEKIT_NODE_0_RE = /\.svelte-kit\/generated\/nodes\/0\.js$/

const VitePlugSveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = ({
  theme = '@svelte-press/theme-default',
} = {}) => {
  const defaultLayout = `
<script>
  import { GlobalLayout } from '${theme}'
  import '@svelte-press/vite/style.css'
  import 'uno.css'
</script>
<GlobalLayout>
  <slot />
</GlobalLayout>
`

  const generateDefaultLayout = (customRootLayoutPath: string) => `
<script>
  import { GlobalLayout } from '${theme}'
  import CustomLayout from '${customRootLayoutPath}'
  import '@svelte-press/vite/style.css'
  import 'uno.css'
</script>
<GlobalLayout>
  <CustomLayout>
    <slot />
  </CustomLayout>
</GlobalLayout>
`

  return {
    name: 'vite-plugin-sveltepress',
    /**
     * must enable this because vite-plugin-svelte enabled this too
     * @see https://github.com/sveltejs/vite-plugin-svelte/blob/1cef575c8f9188456934e38dad7a869b43fe7d46/packages/vite-plugin-svelte/src/index.ts#L58
     */
    enforce: 'pre',
    buildStart() {
      if (!existsSync(BASE_PATH))
        mkdirSync(BASE_PATH, { recursive: true })

      if (ROOT_SERVER_FILES.every(path => !existsSync(path))) {
        // TODO: add auto generated +layout.ts and write `export prerender = true` in it
      }

      // provide default layout file when uer doesn't have one
      if (!existsSync(ROOT_LAYOUT_PATH))
        writeFileSync(DEFAULT_ROOT_LAYOUT_PATH, defaultLayout)
    },
    config: () => ({
      server: {
        fs: {
          allow: ['.sveltepress'],
        },
      },
      resolve: {
        alias: {
          '$sveltepress': resolve(process.cwd(), '.sveltepress'),
          '$svp-theme': theme,
        },
      },
    }),
    async transform(src, id) {
      if (MARKDOWN_FILE_RE.test(id)) {
        const { code } = await mdToSvelte({
          filename: id,
          mdContent: src,
        }) || { code: src }

        return code
      }

      if (ROOT_LAYOUT_RE.test(id)) {
        info('custom root layout id: ', id)
        writeFileSync(DEFAULT_ROOT_LAYOUT_PATH, generateDefaultLayout(id))
      }

      // hack into the sveltekit generate root layout file
      if (SVELTEKIT_NODE_0_RE.test(id))

        return 'export { default as component } from \'$sveltepress/_Layout.svelte\''

      return {
        code: src,
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx
      if (file.endsWith('.md')) {
        const mdContent = await ctx.read()
        const { code } = await mdToSvelte({
          mdContent,
          filename: file,
        })

        // overwrite read() so svelte plugin can handle the HMR
        ctx.read = () => code
      }
    },
  }
}

export default VitePlugSveltepress
