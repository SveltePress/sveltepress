import { fileURLToPath } from 'url'
import { resolve } from 'path'
import type { LoadTheme } from '@svelte-press/vite'
import type { DefaultThemeOptions } from './types'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const THEME_OPTIONS_MODULE = 'sveltepress:theme-default'

const defaultTheme: LoadTheme<DefaultThemeOptions> = (options) => {
  return {
    name: '@svelte-press/theme-default',
    globalLayout: resolve(__dirname, './components/GlobalLayout.svelte'),
    pageLayout: resolve(__dirname, './components/PageLayout.svelte'),
    vitePlugins: {
      name: '@svelte-press/default-theme',
      resolveId(id) {
        if (id === THEME_OPTIONS_MODULE)
          return THEME_OPTIONS_MODULE
      },
      load(id) {
        if (id === THEME_OPTIONS_MODULE)
          return `export default ${JSON.stringify(options || {})}`
      },
    },
  }
}

export {
  defaultTheme,
}
