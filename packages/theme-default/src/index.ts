import admonitions from 'remark-admonitions'
import Unocss from 'unocss/vite'
import { presetUno, transformerDirectives } from 'unocss'
import type { ThemeDefault } from 'virtual:sveltepress/theme-default'
import liveCode from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'
import anchors from './markdown/anchors.js'
import links from './markdown/links.js'
import codeImport from './markdown/code-import.js'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'

const defaultTheme: ThemeDefault = (options) => {
  return {
    name: '@svelte-press/theme-default',
    globalLayout: '@svelte-press/theme-default/GlobalLayout.svelte',
    pageLayout: '@svelte-press/theme-default/PageLayout.svelte',
    vitePlugins: [
      Unocss({
        mode: 'svelte-scoped',
        presets: [
          presetUno(),
        ],
        transformers: [transformerDirectives()],
        theme: {
          breakpoints: {
            sm: '950px',
            md: '1140px',
          },
        },
        shortcuts: {
          'svp-gradient-text': 'bg-gradient-linear bg-clip-text bg-gradient-[45deg,#fa709a,#fee140] text-transparent',
        },
      }),
      {
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
            // Need this for avoiding load virtual modules errors
            optimizeDeps: {
              exclude: ['@svelte-press/theme-default'],
            },
            server: {
              fs: {
                // Need this for dev
                allow: ['../theme-default/src/fonts'],
              },
            },
          }
        },
      }],
    remarkPlugins: [liveCode, admonitions, links, anchors, codeImport],
    highlighter,
    clientImports: [
      'import \'@svelte-press/theme-default/style.css\'',
    ],
  }
}

export {
  defaultTheme,
}
