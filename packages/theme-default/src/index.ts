import { resolve } from 'path'
import { fileURLToPath } from 'url'
import admonitions from 'remark-admonitions'
import Unocss from 'unocss/vite'
import { presetUno, transformerDirectives } from 'unocss'
import type { ThemeDefault } from 'virtual:sveltepress/theme-default'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import liveCode from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'
import anchors from './markdown/anchors.js'
import links from './markdown/links.js'
import codeImport from './markdown/code-import.js'
import { customTypes } from './markdown/admonitions.js'
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'

const defaultTheme: ThemeDefault = options => {
  const vitePluginsPre = [
    Unocss({
      presets: [
        presetUno(),
      ],
      transformers: [transformerDirectives()],
      theme: {
        breakpoints: {
          sm: '950px',
          md: '1240px',
        },
      },
      shortcuts: {
        'svp-gradient-bg': 'bg-gradient-linear bg-gradient-[45deg,#fa709a,#fee140]',
        'svp-gradient-text': 'svp-gradient-bg bg-clip-text text-transparent',
        'svp-modal-bg': 'sm:display-none fixed top-0 bottom-0 right-0 left-0 bg-black dark:bg-white bg-opacity-70 dark:bg-opacity-70 z-900 opacity-0 pointer-events-none transition-opacity transition-300',
        'svp-modal-bg-show': 'opacity-100 pointer-events-auto',
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
    }]

  return {
    name: '@sveltepress/theme-default',
    globalLayout: '@sveltepress/theme-default/GlobalLayout.svelte',
    pageLayout: '@sveltepress/theme-default/PageLayout.svelte',
    vitePlugins: corePlugin => {
      const plugins = [
        ...vitePluginsPre,
        corePlugin,
        SvelteKitPWA({
          ...options.pwa,
          srcDir: resolve(__dirname, './components/pwa'),
        }),
      ]
      return plugins
    },
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
