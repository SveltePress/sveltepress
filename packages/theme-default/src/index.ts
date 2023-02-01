import admonitions from 'remark-admonitions'
import Unocss from 'unocss/vite'
import { presetUno, transformerDirectives } from 'unocss'
import type { ThemeDefault } from 'virtual:sveltepress/theme-default'
import liveCode from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'
import anchors from './markdown/anchors.js'
import links from './markdown/links.js'
import codeImport from './markdown/code-import.js'
import { customTypes } from './markdown/admonitions.js'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'

const defaultTheme: ThemeDefault = (options) => {
  return {
    name: '@sveltepress/theme-default',
    globalLayout: '@sveltepress/theme-default/GlobalLayout.svelte',
    pageLayout: '@sveltepress/theme-default/PageLayout.svelte',
    vitePlugins: [
      Unocss({
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
          'svp-gradient-bg': 'bg-gradient-linear bg-gradient-[45deg,#fa709a,#fee140]',
          'svp-gradient-text': 'svp-gradient-bg bg-clip-text text-transparent',
        },
      }),
      {
        name: '@sveltepress/default-theme',
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
            optimizeDeps: {
              exclude: ['@sveltepress/theme-default'],
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
    remarkPlugins: [
      liveCode,
      [admonitions, { customTypes }] as any,
      links,
      anchors,
      codeImport],
    highlighter,
  }
}

export {
  defaultTheme,
}
