import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import type { PluginOption } from 'vite'
import { resolve } from 'node:path'
import process from 'node:process'
import extractorSvelte from '@unocss/extractor-svelte'
import { presetIcons, presetUno, transformerDirectives } from 'unocss'
import Unocss from 'unocss/vite'
import { generateSidebar, isAutoSidebarOptions } from '../auto-sidebar.js'
import { SERVICE_WORKER_PATH } from '../constants.js'
import { initHighlighter } from '../markdown/highlighter.js'
import { searchIndexPlugin } from './search-index-plugin.js'

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

  // Resolve auto-sidebar if configured
  const resolvedOptions = { ...options }
  let autoSidebarRoutesDir: string | undefined
  if (isAutoSidebarOptions(resolvedOptions.sidebar)) {
    autoSidebarRoutesDir = resolve(resolvedOptions.sidebar.routesDir || 'src/routes')
    resolvedOptions.sidebar = generateSidebar(resolvedOptions.sidebar)
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
          return `export default ${JSON.stringify(resolvedOptions || {})}`
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
      configureServer(server) {
        if (!autoSidebarRoutesDir || !isAutoSidebarOptions(options?.sidebar))
          return

        const autoOpts = options.sidebar
        // Watch routes directory for file additions/deletions to regenerate sidebar
        server.watcher.add(autoSidebarRoutesDir)
        const regenerate = () => {
          resolvedOptions.sidebar = generateSidebar(autoOpts)
          const mod = server.moduleGraph.getModuleById(THEME_OPTIONS_MODULE)
          if (mod) {
            server.moduleGraph.invalidateModule(mod)
            server.ws.send({ type: 'full-reload' })
          }
        }
        server.watcher.on('add', (path) => {
          if (path.includes('+page.'))
            regenerate()
        })
        server.watcher.on('unlink', (path) => {
          if (path.includes('+page.'))
            regenerate()
        })
      },
    },
  ]

  // Add built-in search plugin when enabled
  // Built-in search is active when:
  // 1. builtinSearch.enabled is explicitly true, OR
  // 2. builtinSearch is not configured AND no custom search/docsearch is provided
  const hasCustomSearch = !!(options?.search || options?.docsearch)
  const builtinEnabled = options?.builtinSearch?.enabled ?? !hasCustomSearch
  if (builtinEnabled) {
    vitePluginsPre.push(searchIndexPlugin(true))
  }
  else {
    // Always register the plugin (resolves the virtual module) but with empty data
    vitePluginsPre.push(searchIndexPlugin(false))
  }

  return vitePluginsPre
}
