import { resolve } from 'node:path'
import { cwd } from 'node:process'

export const SERVICE_WORKER_PATH = resolve(cwd(), 'node_modules/@sveltepress/theme-default/dist/components/pwa/sw.js')
