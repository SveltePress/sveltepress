import { resolve } from 'path'
import { fileURLToPath } from 'url'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, transformerDirectives } from 'unocss'
import type { ThemeDefault } from 'virtual:sveltepress/theme-default'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import type { PluginOption } from 'vite'
import admonitions from './markdown/admonitions.js'
import liveCode from './markdown/live-code.js'
import highlighter from './markdown/highlighter.js'
import anchors from './markdown/anchors.js'
import links from './markdown/links.js'
import codeImport from './markdown/code-import.js'
import installPkg from './markdown/install-pkg.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'
const VIRTUAL_PWA = 'virtual:pwa-info'
const VIRTUAL_PWA_SVELTE_REGISTER = 'virtual:pwa-register/svelte'

const DEFAULT_GRADIENT = {
  start: '#fa709a',
  end: '#fee140',
}

const DEFAULT_PRIMARY = '#fb7185'

const DEFAULT_HOVER = '#f43f5e'

const defaultTheme: ThemeDefault = options => {
  const { gradient = DEFAULT_GRADIENT, primary = DEFAULT_PRIMARY, hover = DEFAULT_HOVER } = options?.themeColor || {
    gradient: DEFAULT_GRADIENT,
    primary: DEFAULT_PRIMARY,
    hover: DEFAULT_HOVER,
  }

  const vitePluginsPre: PluginOption = [
    Unocss({
      mode: 'svelte-scoped',
      presets: [
        presetUno(),
        presetIcons(),
      ],
      transformers: [transformerDirectives()],
      theme: {
        colors: {
          svp: {
            primary,
            hover,
          },
        },
        breakpoints: {
          sm: '950px',
          md: '1240px',
        },
      },
      shortcuts: {
        'svp-gradient-bg': `bg-gradient-linear bg-gradient-[45deg,${gradient.start},${gradient.end}]`,
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
      ]
      if (options?.pwa) {
        plugins.push(SvelteKitPWA({
          ...options.pwa,
          srcDir: resolve(__dirname, './components/pwa'),
        }))
      } else {
        // In case of pwa relative virtual modules are not found
        plugins.push({
          name: '@sveltepress/virtual-pwa',
          resolveId(id) {
            if (id === VIRTUAL_PWA)
              return VIRTUAL_PWA
            if (id === VIRTUAL_PWA_SVELTE_REGISTER)
              return VIRTUAL_PWA_SVELTE_REGISTER
          },
          load(id) {
            if (id === VIRTUAL_PWA)
              return 'export const pwaInfo = null'
            if (id === VIRTUAL_PWA_SVELTE_REGISTER)
              return 'export const useRegisterSW = () => ({ needRefresh: false, updateServiceWorker: false, offlineReady: false })'
          },
        })
      }
      return plugins
    },
    remarkPlugins: [
      liveCode,
      admonitions,
      links,
      anchors,
      codeImport,
      installPkg,
    ],
    highlighter,
  }
}

export {
  defaultTheme,
}
