/// <reference types="vite/client" />
/// <reference types="@sveltepress/vite/types" />
/// <reference types="@sveltejs/kit/vite" />

declare module 'virtual:sveltepress/theme-default' {
  import type { DocSearchProps } from '@sveltepress/docsearch/types'
  import type { CreateTwoslashSvelteOptions } from '@sveltepress/twoslash'
  import type { LoadTheme } from '@sveltepress/vite'
  import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit'
  import type { BundledTheme } from 'shiki'
  import type { BundledLanguage } from 'shiki/langs'
  import type { Component } from 'svelte'

  export interface WithTitle {
    title?: string
  }

  export interface LinkItem extends WithTitle {
    icon?: string
    to?: string
    external?: boolean
    collapsible?: boolean
    items?: LinkItem[]
  }

  export interface AutoSidebarOptions {
    /**
     * Enable auto-generated sidebar
     */
    enabled: boolean
    /**
     * Routes directory, default 'src/routes'
     */
    routesDir?: string
    /**
     * Root paths to generate sidebar for, e.g. ['/guide/', '/reference/']
     * If not specified, auto-detect from top-level route directories
     */
    roots?: string[]
  }

  export interface DefaultThemeOptions {
    navbar?: Array<LinkItem>
    github?: string
    logo?: string
    sidebar?: Record<string, LinkItem[]> | AutoSidebarOptions
    editLink?: string
    discord?: string
    ga?: string
    pwa?: SvelteKitPWAOptions & {
      darkManifest?: string
      precachePages?: boolean
    }
    docsearch?: Omit<DocSearchProps, 'container' | 'theme'>
    search?: Component | string | boolean
    themeColor?: {
      light: string
      dark: string
      primary?: string
      /**
       * Darker variant of primary, used for accent text on light backgrounds
       * where the primary color alone lacks contrast.
       * Defaults to `#e11d48` when primary is not customized, otherwise falls back to primary.
       */
      primaryDeep?: string
      hover?: string
      gradient?: {
        start: string
        end: string
      }
    }
    highlighter?: {
      languages?: BundledLanguage[]
      themeLight?: BundledTheme
      themeDark?: BundledTheme
      twoslash?: boolean | CreateTwoslashSvelteOptions
      /**
       * Code blocks taller than this many lines start collapsed with an
       * "Expand code" bar. Set to 0 to disable collapsing.
       * @default 30
       */
      codeCollapseLines?: number
    }
    i18n?: {
      navbarMenu?: string
      heroCode?: {
        title?: string
        messageBefore?: string
        messageStrong?: string
        messageAfter?: string
        tipLabel?: string
        counterLabel?: string
      }
      onThisPage?: string
      suggestChangesToThisPage?: string
      lastUpdateAt?: string
      previousPage?: string
      nextPage?: string
      expansionTitle?: string
      /** Label of the expand bar on collapsed long code blocks */
      expandCode?: string
      pwa?: {
        tip?: string
        reload?: string
        close?: string
        appReadyToWorkOffline?: string
        newContentAvailable?: string
      }
      footnoteLabel?: string
      /** Label of the language switcher trigger. */
      localeSwitcher?: string
      /** Notice shown after switching locale fell back to that locale's home. */
      localePageUnavailable?: string
      versionSelector?: string
      versionPageUnavailable?: string
      versionDeprecated?: string
      versionEol?: string
      versionViewCurrent?: string
      versionDeprecatedLabel?: string
      versionEolLabel?: string
      versionSearchUnavailable?: string
      /** Template for page and section badges. Use `{version}` for the version label. */
      versionNewLabel?: string
      /** Compact badge shown beside changed sidebar pages and table-of-contents sections. */
      versionNavigationNewLabel?: string
      versionChangesSelector?: string
      versionChangesNewPages?: string
      versionChangesUpdatedPages?: string
      versionChangesNoBaseline?: string
      versionChangesEmpty?: string
      searchPlaceholder?: string
      searchNoResults?: string
      searchDevNotice?: string
      searchClose?: string
      searchClear?: string
    }
    preBuildIconifyIcons?: {
      [iconSetName: string]: string[]
    }
  }
  export type ThemeDefault = LoadTheme<DefaultThemeOptions>

  const options: DefaultThemeOptions
  export default options
}

declare module '@sveltepress/theme-default/context' {
  import type { Writable } from 'svelte/store'

  export interface SveltepressContext {
    isDark: Writable<boolean>
  }
  export const SVELTEPRESS_CONTEXT_KEY: symbol
}

declare module 'virtual:sveltepress/theme-default/versioning' {
  export * from '@sveltepress/theme-default/dist/components/versioning'
}

declare module 'virtual:sveltepress/theme-default/VersionSelector.svelte' {
  import type { Component } from 'svelte'

  const component: Component<{ mobile?: boolean }>
  export default component
}

declare module 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte' {
  import type { Component } from 'svelte'

  const component: Component
  export default component
}

declare module 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte' {
  import type { Component } from 'svelte'

  const component: Component
  export default component
}
