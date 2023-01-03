import { fileURLToPath } from 'url'
import { resolve } from 'path'
import type { LoadTheme } from '@svelte-press/vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const defaultTheme: LoadTheme = () => {
  return {
    name: '@svelte-press/theme-default',
    globalLayout: resolve(__dirname, './components/GlobalLayout.svelte'),
  }
}

export {
  defaultTheme,
}
