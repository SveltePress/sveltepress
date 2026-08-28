import type { ResolvedTheme, ThemeVitePlugins, VersionPluginOptions } from '@sveltepress/vite'
import type { loadVersionManifest } from '@sveltepress/vite/versioning'
import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit'
import type { DefaultThemeOptions, ThemeDefault } from 'virtual:sveltepress/theme-default'
import process from 'node:process'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { SERVICE_WORKER_PATH } from './constants.js'
import admonitions from './markdown/admonitions.js'
import anchors from './markdown/anchors.js'
import codeImport from './markdown/code-import.js'
import highlighter, { initHighlighter } from './markdown/highlighter.js'
import installPkg from './markdown/install-pkg.js'
import links from './markdown/links.js'
import liveCode from './markdown/live-code.js'
import versionChanges from './markdown/version-changes.js'
import { createVersionManifestReader } from './version-manifest.js'
import createPreCorePlugins from './vite-plugins/create-pre-core-plugins.js'

export { generateSidebar, isAutoSidebarOptions } from './auto-sidebar.js'
export type { AutoSidebarOptions } from './auto-sidebar.js'
export { SERVICE_WORKER_PATH } from './constants.js'

const VIRTUAL_PWA = 'virtual:pwa-info'
const VIRTUAL_PWA_SVELTE_REGISTER = 'virtual:pwa-register/svelte'

export const themeOptionsRef: {
  value?: DefaultThemeOptions
} = {
  value: undefined,
}

const defaultTheme: ThemeDefault = (options) => {
  themeOptionsRef.value = options
  let versionOptions: VersionPluginOptions
  const readVersionManifest = createVersionManifestReader(process.cwd(), () => versionOptions)
  let versionManifest = null as ReturnType<typeof loadVersionManifest>
  const vitePlugins = (async (corePlugin) => {
    versionManifest = readVersionManifest()
    const plugins = [
      ...await createPreCorePlugins(options, versionManifest),
      corePlugin,
    ]
    if (options?.pwa) {
      const pwaOptions = options.pwa as SvelteKitPWAOptions & Record<string, any>
      const historicalGlob = versionManifest
        ? `prerendered/pages${versionManifest.basePath}/**/*.html`
        : null
      const versionRuntimeCaching = versionManifest
        ? [{
            urlPattern: new RegExp(`^${versionManifest.basePath}/`),
            handler: 'NetworkFirst' as const,
            options: { cacheName: 'sveltepress-version-pages' },
          }]
        : []
      plugins.push(SvelteKitPWA({
        strategies: 'injectManifest',
        srcDir: SERVICE_WORKER_PATH.replace(/sw\.js$/, ''),
        filename: 'sw.js',
        ...pwaOptions,
        injectManifest: {
          globDirectory: '.svelte-kit/output',
          globPatterns: [
            'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
            'prerendered/**/*.html',
          ],
          ...pwaOptions.injectManifest,
          ...(historicalGlob
            ? { globIgnores: [...(pwaOptions.injectManifest?.globIgnores ?? []), historicalGlob] }
            : {}),
        },
        workbox: {
          ...pwaOptions.workbox,
          ...(historicalGlob
            ? { globIgnores: [...(pwaOptions.workbox?.globIgnores ?? []), historicalGlob] }
            : {}),
          runtimeCaching: [...(pwaOptions.workbox?.runtimeCaching ?? []), ...versionRuntimeCaching],
        },
      }))
    }
    else {
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
  }) as ThemeVitePlugins
  return {
    name: '@sveltepress/theme-default',
    globalLayout: '@sveltepress/theme-default/GlobalLayout.svelte',
    pageLayout: '@sveltepress/theme-default/PageLayout.svelte',
    vitePlugins,
    remarkPlugins: [
      liveCode,
      versionChanges({
        getManifest: readVersionManifest,
        newLabel: options?.i18n?.versionNewLabel,
      }),
      admonitions,
      links,
      anchors,
      codeImport,
      installPkg,
    ],
    highlighter,
    footnoteLabel: options?.i18n?.footnoteLabel,
    configureVersions(versions) {
      versionOptions = versions
    },
  } satisfies ResolvedTheme
}

export {
  defaultTheme,
  highlighter,
  initHighlighter,
}
