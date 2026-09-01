declare module 'virtual:sveltepress/site' {
  const siteConfig: {
    title: string
    description: string
  }

  export default siteConfig
}

declare module 'virtual:sveltepress/versions' {
  import type { VersionManifest, VersionRuntime } from '@sveltepress/vite/versioning'

  export const manifest: VersionManifest | null
  /** Manifests keyed by locale prefix; only populated on a multi-locale site. */
  export const manifests: Record<string, VersionManifest | null>
  /** Resolve the version manifest for a route by its locale. */
  export const resolveVersionManifest: (pathname: string) => VersionManifest | null
  export const changeSets: VersionRuntime['changeSets']
  export const resolveVersionChanges: VersionRuntime['resolveVersionChanges']
  export const resolveVersionContext: VersionRuntime['resolveVersionContext']
  export const resolveVersionedPath: VersionRuntime['resolveVersionedPath']
  export const resolveVersionSwitch: VersionRuntime['resolveVersionSwitch']
  const runtime: VersionRuntime
  export default runtime
}

declare module 'virtual:sveltepress/locale' {
  import type { LocalesConfig, LocaleSwitchTarget, ResolvedLocale } from '@sveltepress/vite'

  export const locales: LocalesConfig | null
  export const resolveLocale: (pathname: string) => ResolvedLocale | null
  export const resolveLocalizedPath: (to: string, locale: ResolvedLocale | null) => string
  export const resolveLocaleSwitch: (pathname: string, targetPrefix: string) => LocaleSwitchTarget | null
  const localeRuntime: {
    locales: LocalesConfig | null
    resolveLocale: (pathname: string) => ResolvedLocale | null
    resolveLocalizedPath: (to: string, locale: ResolvedLocale | null) => string
    resolveLocaleSwitch: (pathname: string, targetPrefix: string) => LocaleSwitchTarget | null
  }
  export default localeRuntime
}

declare module '*.md' {
  import type { SvelteComponentTyped } from 'svelte'

  const comp: SvelteComponentTyped
  export default comp
}
