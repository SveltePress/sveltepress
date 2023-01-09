import { fileURLToPath } from 'url'
import { resolve } from 'path'
import type { LoadTheme } from '@svelte-press/vite'
import admonitions from 'remark-admonitions'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import type { DefaultThemeOptions } from './types'
import liveCode, { safelist } from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const THEME_OPTIONS_MODULE = 'sveltepress:theme-default'

const defaultTheme: LoadTheme<DefaultThemeOptions> = (options) => {
  return {
    name: '@svelte-press/theme-default',
    globalLayout: resolve(__dirname, './components/GlobalLayout.svelte'),
    pageLayout: resolve(__dirname, './components/PageLayout.svelte'),
    vitePlugins: [
      Unocss({
        presets: [
          presetAttributify(),
          presetUno(),
          presetIcons(),
        ],
        transformers: [transformerDirectives()],
        safelist,
      }), {
        name: '@svelte-press/default-theme',
        resolveId(id) {
          if (id === THEME_OPTIONS_MODULE)
            return THEME_OPTIONS_MODULE
        },
        load(id) {
          if (id === THEME_OPTIONS_MODULE)
            return `export default ${JSON.stringify(options || {})}`
        },
        config() {
          return {
            server: {
              fs: {
                // Need this for dev
                allow: ['../theme-default/dist/fonts'],
              },
            },
          }
        },
      }],
    remarkPlugins: [liveCode, admonitions],
    highlighter,
    clientImports: [
      'import \'uno.css\'',
      'import \'@svelte-press/theme-default/style.css\'',
    ],
  }
}

export {
  defaultTheme,
}
