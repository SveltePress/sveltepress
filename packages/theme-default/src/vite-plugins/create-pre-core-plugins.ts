import type { VersionManifest } from '@sveltepress/vite/versioning'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import type { PluginOption } from 'vite'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import extractorSvelte from '@unocss/extractor-svelte'
import { presetIcons, presetUno, transformerDirectives } from 'unocss'
import Unocss from 'unocss/vite'
import { generateSidebar, isAutoSidebarOptions } from '../auto-sidebar.js'
import { SERVICE_WORKER_PATH } from '../constants.js'
import { initHighlighter } from '../markdown/highlighter.js'
import { buildCustomSearchModule, CUSTOM_SEARCH_MODULE, resolveCustomSearchFile } from './custom-search-module.js'
import { stripVersioningForManifestlessSite } from './strip-versioning.js'

const THEME_OPTIONS_MODULE = 'virtual:sveltepress/theme-default'
const THEME_VERSIONING_MODULE = 'virtual:sveltepress/theme-default/versioning'
const VERSION_SELECTOR_MODULE = 'virtual:sveltepress/theme-default/VersionSelector.svelte'
const VERSION_FALLBACK_MODULE = 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte'
const VERSION_LIFECYCLE_MODULE = 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte'
const LOCALE_SELECTOR_MODULE = 'virtual:sveltepress/theme-default/LocaleSelector.svelte'
const LOCALE_FALLBACK_MODULE = 'virtual:sveltepress/theme-default/LocaleFallbackNotice.svelte'

const VERSIONING_PATH = fileURLToPath(new URL('../components/versioning.js', import.meta.url))
const VERSIONING_DISABLED_PATH = fileURLToPath(new URL('../components/versioning-disabled.js', import.meta.url))
const VERSION_SELECTOR_PATH = fileURLToPath(new URL('../components/VersionSelector.svelte', import.meta.url))
const VERSION_FALLBACK_PATH = fileURLToPath(new URL('../components/VersionFallbackNotice.svelte', import.meta.url))
const VERSION_LIFECYCLE_PATH = fileURLToPath(new URL('../components/VersionLifecycleBanner.svelte', import.meta.url))
const VERSION_COMPONENT_DISABLED_PATH = fileURLToPath(new URL('../components/VersioningDisabled.svelte', import.meta.url))
const LOCALE_SELECTOR_PATH = fileURLToPath(new URL('../components/LocaleSelector.svelte', import.meta.url))
const LOCALE_FALLBACK_PATH = fileURLToPath(new URL('../components/LocaleFallbackNotice.svelte', import.meta.url))

// One gradient family across the theme: deep rose → amber. The button fill
// ends at amber-700 so white label text stays AA-readable across the pill.
const DEFAULT_GRADIENT = {
  start: '#e11d48',
  end: '#b45309',
}

// Clipped text gradients need mode-aware endpoints: a deeper rose→amber in
// light mode (readable on white) and the vibrant rose→amber in dark mode.
const DEFAULT_GRADIENT_TEXT = {
  light: { start: '#e11d48', end: '#d97706' },
  dark: { start: '#fb7185', end: '#fbbf24' },
}

const DEFAULT_PRIMARY = '#fb7185'

// Accent text on light backgrounds: #fb7185 is only ~2.7:1 on white,
// so text usages pair this deeper rose (light mode) with primary (dark mode)
const DEFAULT_PRIMARY_DEEP = '#e11d48'

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

export default async (options?: DefaultThemeOptions, versionManifest?: VersionManifest | null) => {
  await initHighlighter(options?.highlighter)
  const { gradient = DEFAULT_GRADIENT, primary = DEFAULT_PRIMARY, hover = DEFAULT_HOVER } = options?.themeColor || {
    gradient: DEFAULT_GRADIENT,
    primary: DEFAULT_PRIMARY,
    hover: DEFAULT_HOVER,
  }
  // No color math on user-supplied primaries — fall back to their primary as-is
  const primaryDeep = options?.themeColor?.primaryDeep
    ?? (options?.themeColor?.primary ? primary : DEFAULT_PRIMARY_DEEP)

  // A user-supplied gradient drives text clipping in both color modes;
  // otherwise the dark-aware default pair keeps the title legible on white.
  const userGradient = options?.themeColor?.gradient
  const textGradient = userGradient
    ? { light: userGradient, dark: userGradient }
    : DEFAULT_GRADIENT_TEXT

  // Resolve auto-sidebar if configured
  const resolvedOptions = { ...options }
  let autoSidebarRoutesDir: string | undefined
  if (isAutoSidebarOptions(resolvedOptions.sidebar)) {
    autoSidebarRoutesDir = resolve(resolvedOptions.sidebar.routesDir || 'src/routes')
    resolvedOptions.sidebar = generateSidebar(resolvedOptions.sidebar)
  }
  const iconSafelist = getIconSafelist(options)

  // Resolve the configured custom-search source path lazily (the site root is
  // only known after the config resolves) and serve it through a lazy literal
  // dynamic import so a static production build bundles the wrapper.
  let customSearchFile: string | null = null
  let customSearchRoot = process.cwd()

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
            primary: {
              DEFAULT: primary,
              deep: primaryDeep,
            },
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
        'svp-gradient-text': `bg-gradient-linear bg-gradient-[45deg,${textGradient.light.start},${textGradient.light.end}] dark:bg-gradient-[45deg,${textGradient.dark.start},${textGradient.dark.end}] bg-clip-text text-transparent`,
        'svp-modal-bg': 'sm:hidden fixed top-0 bottom-0 right-0 left-0 bg-black dark:bg-white bg-opacity-70 dark:bg-opacity-70 z-900 opacity-0 pointer-events-none transition-opacity transition-300',
        'svp-modal-bg-show': 'opacity-100 pointer-events-auto',
      },
      safelist: [
        ...iconSafelist,
      ],
    }),
    {
      name: '@sveltepress/default-theme',
      enforce: 'pre',
      api: {
        sveltepress: {
          themeSnapshot: {
            sidebar: resolvedOptions.sidebar,
          },
        },
      },
      resolveId(id) {
        if (id === THEME_OPTIONS_MODULE)
          return THEME_OPTIONS_MODULE
        if (id === CUSTOM_SEARCH_MODULE)
          return CUSTOM_SEARCH_MODULE
        if (id === THEME_VERSIONING_MODULE)
          return versionManifest ? VERSIONING_PATH : VERSIONING_DISABLED_PATH
        if (id === VERSION_SELECTOR_MODULE)
          return versionManifest ? VERSION_SELECTOR_PATH : VERSION_COMPONENT_DISABLED_PATH
        if (id === VERSION_FALLBACK_MODULE)
          return versionManifest ? VERSION_FALLBACK_PATH : VERSION_COMPONENT_DISABLED_PATH
        if (id === VERSION_LIFECYCLE_MODULE)
          return versionManifest ? VERSION_LIFECYCLE_PATH : VERSION_COMPONENT_DISABLED_PATH
        if (id === LOCALE_SELECTOR_MODULE)
          return LOCALE_SELECTOR_PATH
        if (id === LOCALE_FALLBACK_MODULE)
          return LOCALE_FALLBACK_PATH
      },
      load(id) {
        if (id === THEME_OPTIONS_MODULE)
          return `export default ${JSON.stringify(resolvedOptions || {})}`
        if (id === CUSTOM_SEARCH_MODULE)
          return buildCustomSearchModule(customSearchFile)
      },
      configResolved(config) {
        customSearchRoot = config.root
        customSearchFile = resolveCustomSearchFile(options?.search, customSearchRoot)
      },
      transform(source, id) {
        if (!versionManifest)
          return stripVersioningForManifestlessSite(source, id) ?? undefined
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

  return vitePluginsPre
}
