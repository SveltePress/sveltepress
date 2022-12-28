import type { Plugin } from 'vite'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')
export const LIVE_CODE_PATH = resolve(BASE_PATH, 'live-code')

const GLOBAL_CSS_MODULE = 'virtual:sveltepress'
const RESOLVED_GLOBAL_CSS_MODULE = `\0${GLOBAL_CSS_MODULE}`

const VitePlugSveltepress: () => Plugin = () => {
  return {
      name: 'vite-plugin-sveltepress',
      buildStart() {
        if (!existsSync(BASE_PATH))
          mkdirSync(LIVE_CODE_PATH, { recursive: true })
        if (!existsSync(LIVE_CODE_PATH))
          mkdirSync(LIVE_CODE_PATH)
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
          },
        },
      }),
      resolveId(id) {
        if (id === GLOBAL_CSS_MODULE) {
          return RESOLVED_GLOBAL_CSS_MODULE
        }
      },
      load(id) {
        if (id === RESOLVED_GLOBAL_CSS_MODULE) {
          return `import '@casual-ui/svelte/dist/style/style.css'
import '@svelte-press/svelte-preprocessor/dist/main.css'
import 'uno.css'
  `
      }
    },
  }
}

export default VitePlugSveltepress