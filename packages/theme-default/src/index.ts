import type { LoadTheme } from '@svelte-press/vite'
import admonitions from 'remark-admonitions'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import safelist from './markdown/uno-safelist.js'
import liveCode from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'
const THEME_OPTIONS_MODULE_RESOLVED = `\0${THEME_OPTIONS_MODULE}`

const defaultTheme: LoadTheme<DefaultThemeOptions> = (options) => {
  return {
    name: '@svelte-press/theme-default',
    globalLayout: '@svelte-press/theme-default/GlobalLayout.svelte',
    pageLayout: '@svelte-press/theme-default/PageLayout.svelte',
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
            return THEME_OPTIONS_MODULE_RESOLVED
        },
        load(id) {
          if (id === THEME_OPTIONS_MODULE_RESOLVED)
            return `export default ${JSON.stringify(options || {})}`
        },
        config() {
          return {
            server: {
              fs: {
                // Need this for dev
                allow: ['../theme-default/src/fonts'],
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
