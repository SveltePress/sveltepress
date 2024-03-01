import process from 'node:process'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, transformerCompileClass, transformerDirectives } from 'unocss'
import type { PluginOption } from 'vite'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'

const DEFAULT_GRADIENT = {
  start: '#fa709a',
  end: '#fee140',
}

const DEFAULT_PRIMARY = '#fb7185'

const DEFAULT_HOVER = '#f43f5e'

export default (options?: DefaultThemeOptions) => {
  const { gradient = DEFAULT_GRADIENT, primary = DEFAULT_PRIMARY, hover = DEFAULT_HOVER } = options?.themeColor || {
    gradient: DEFAULT_GRADIENT,
    primary: DEFAULT_PRIMARY,
    hover: DEFAULT_HOVER,
  }

  const vitePluginsPre: PluginOption = [
    Unocss({
      presets: [
        presetUno(),
        presetIcons(),
      ],
      transformers: [transformerCompileClass(), transformerDirectives()],
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
        'svp-modal-bg': 'sm:hidden fixed top-0 bottom-0 right-0 left-0 bg-black dark:bg-white bg-opacity-70 dark:bg-opacity-70 z-900 opacity-0 pointer-events-none transition-opacity transition-300',
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
          define: {
            'process.env.NODE_ENV': process.env.NODE_ENV === 'production'
              ? '"production"'
              : '"development"',
          },
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

  return vitePluginsPre
}
