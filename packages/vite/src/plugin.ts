import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { PluginOption } from 'vite'
import type { SveltepressVitePluginOptions, Theme } from './types'
import * as log from './utils/log.js'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')
export const LIVE_CODE_PATH = resolve(BASE_PATH, 'live-code')

const ROOT_LAYOUT_RE = /routes\/\+layout\.(svelte|md)$/
const SVELTE_SCRIPT_RE = /<script( ((context="module")|(lang="ts"))+){0,2}>/

const resolveRootLayoutScripts: (theme: Theme) => string = theme => `
  import { GlobalLayout } from '@svelte-press/theme-${theme}'
  import '@svelte-press/vite/style.css'
  import '@svelte-press/svelte-preprocessor/dist/main.css'
  import 'uno.css'
`
const AUTO_ADDED_ROOT_LAYOUT_FILE_ID = resolve(process.cwd(), 'src/+layout.server.ts')

const ROOT_SERVER_FILES = [
  AUTO_ADDED_ROOT_LAYOUT_FILE_ID,
  resolve(process.cwd(), 'src/routes/+layout.server.js'),
  resolve(process.cwd(), 'src/routes/+layout.js'),
  resolve(process.cwd(), 'src/routes/+layout.ts'),
]

const VitePlugSveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = ({
  theme = 'default',
} = {}) => {
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
        this.emitFile({
          type: 'chunk',
          id: AUTO_ADDED_ROOT_LAYOUT_FILE_ID,
        })
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
    resolveId(id) {
      if (id === AUTO_ADDED_ROOT_LAYOUT_FILE_ID)
        return id
    },
    load(id) {
      if (id === AUTO_ADDED_ROOT_LAYOUT_FILE_ID)
        return 'export const prerender = true'
    },
    transform(src, id) {
      if (id === AUTO_ADDED_ROOT_LAYOUT_FILE_ID) {
        if (!/export const prerender = true/.test(src))
          src += '\nexport const prerender = true'
        log.info(id, src)
      }

      if (ROOT_LAYOUT_RE.test(id)) {
        const resolvedRootLayoutScripts = resolveRootLayoutScripts(theme)
        if (SVELTE_SCRIPT_RE.test(src)) {
          src = src.replace(SVELTE_SCRIPT_RE, matched => `${matched}${resolvedRootLayoutScripts}`)
        }
        else {
          src = `<script>${resolvedRootLayoutScripts}</script>
${src}`
        }
      }

      return {
        code: src,
      }
    },
  }
}

export default VitePlugSveltepress
