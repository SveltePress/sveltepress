import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import type { PluginOption } from 'vite'
import process from 'node:process'
import extractorSvelte from '@unocss/extractor-svelte'
import { presetIcons, presetUno, transformerDirectives } from 'unocss'
import Unocss from 'unocss/vite'
import { SERVICE_WORKER_PATH } from '../constants.js'
import { initHighlighter } from '../markdown/highlighter.js'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'

const DEFAULT_GRADIENT = {
  start: '#fa709a',
  end: '#fee140',
}

const DEFAULT_PRIMARY = '#fb7185'

const DEFAULT_HOVER = '#f43f5e'

function getIconSafelist(themeOptions?: DefaultThemeOptions): string[] {
  const icons = themeOptions?.preBuildIconifyIcons
  if (!icons)
    return []
  const iconSafelist: string[] = []
  for (const prefix in icons) {
    icons[prefix].forEach((name) => {
      iconSafelist.push(`i-${prefix}-${name}`)
    })
  }
  return iconSafelist
}

export default async (options?: DefaultThemeOptions) => {
  await initHighlighter(options?.highlighter)
  const { gradient = DEFAULT_GRADIENT, primary = DEFAULT_PRIMARY, hover = DEFAULT_HOVER } = options?.themeColor || {
    gradient: DEFAULT_GRADIENT,
    primary: DEFAULT_PRIMARY,
    hover: DEFAULT_HOVER,
  }

  const iconSafelist = getIconSafelist(options)

  const vitePluginsPre: PluginOption = [
    Unocss({
      extractors: [
        extractorSvelte(),
      ],
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
        'svp-modal-bg': 'sm:hidden fixed top-0 bottom-0 right-0 left-0 bg-black dark:bg-white bg-opacity-70 dark:bg-opacity-70 z-900 opacity-0 pointer-events-none transition-opacity transition-300',
        'svp-modal-bg-show': 'opacity-100 pointer-events-auto',
      },
      safelist: [
        ...iconSafelist,
      ],
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
      async config() {
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
              allow: [SERVICE_WORKER_PATH, 'node_modules/@sveltepress/theme-default/dist/fonts', '../theme-default/dist/fonts'],
            },
          },
        }
      },
    },
  ]

  return vitePluginsPre
}
