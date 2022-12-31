import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import type { PluginOption } from 'vite'
import type { SveltepressVitePluginOptions } from './types'
import mdToSvelte from './markdown/mdToSvelte.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')
export const LIVE_CODE_PATH = resolve(BASE_PATH, 'live-code')
const CUSTOM_LAYOUT_PATH = resolve(BASE_PATH, 'CustomLayout.svelte')

const ROOT_LAYOUT_RE = /routes\/\+layout\.(svelte|md)$/
const MARKDOWN_FILE_RE = /\.md$/

const AUTO_ADDED_ROOT_LAYOUT_FILE_ID = resolve(process.cwd(), 'src/+layout.server.ts')

const ROOT_SERVER_FILES = [
  AUTO_ADDED_ROOT_LAYOUT_FILE_ID,
  resolve(process.cwd(), 'src/routes/+layout.server.js'),
  resolve(process.cwd(), 'src/routes/+layout.js'),
  resolve(process.cwd(), 'src/routes/+layout.ts'),
]

const VitePlugSveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = ({
  theme = '@svelte-press/theme-default',
} = {}) => {
  const wrappedRootLayout = `
<script>
  import CustomLayout from '${CUSTOM_LAYOUT_PATH}'
  import { GlobalLayout } from '${theme}'
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
        mkdirSync(LIVE_CODE_PATH, { recursive: true })
      if (!existsSync(LIVE_CODE_PATH))
        mkdirSync(LIVE_CODE_PATH)
      if (ROOT_SERVER_FILES.every(path => !existsSync(path))) {
        // TODO: add auto generated +layout.ts and write `export prerender = true` in it
      }
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
    async transform(src, id) {
      if (MARKDOWN_FILE_RE.test(id)) {
        return await mdToSvelte({
          filename: id,
          mdContent: src,
        })
      }
      if (ROOT_LAYOUT_RE.test(id)) {
        writeFileSync(CUSTOM_LAYOUT_PATH, src)
        return {
          code: wrappedRootLayout,
        }
      }

      return {
        code: src,
      }
    },
  }
}

export default VitePlugSveltepress
