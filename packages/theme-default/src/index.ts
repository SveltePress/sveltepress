import { resolve } from 'path'
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
    // For global layout can only use the absolute path since the import may happen in
    // @sveltejs/kit/src/runtime/components/layout.svelte.
    // Which can't access @svelte-press/theme-default package
    globalLayout: resolve(process.cwd(), './node_modules/@svelte-press/theme-default/dist/components/GlobalLayout.svelte'),
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
          'svp-gradient-bg': 'bg-gradient-linear bg-gradient-[45deg,#fa709a,#fee140]',
          'svp-gradient-text': 'svp-gradient-bg bg-clip-text text-transparent',
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
            optimizeDeps: {
              exclude: ['@svelte-press/theme-default'],
            },
            server: {
              fs: {
                // Need this for dev
                allow: ['../theme-default/dist/fonts'],
              },
            },
          }
        },
      }],
    remarkPlugins: [liveCode, admonitions, links, anchors, codeImport],
    highlighter,
  }
}

export {
  defaultTheme,
}
