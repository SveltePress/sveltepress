import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { Plugin } from 'vite'

export const BASE_PATH = resolve(process.cwd(), '.sveltepress')
export const LIVE_CODE_PATH = resolve(BASE_PATH, 'live-code')

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
          '$live-code': resolve(process.cwd(), '.sveltepress/live-code'),
        },
      },
    }),
  }
}

export default VitePlugSveltepress
