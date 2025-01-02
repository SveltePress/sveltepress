/// <reference types="vite/client" />
/// <reference types="@sveltepress/vite/types" />
/// <reference types="@sveltejs/kit/vite" />

declare module 'virtual:sveltepress/theme-default' {
  import type { CreateTwoslashSvelteOptions } from '@sveltepress/twoslash'
  import type { LoadTheme } from '@sveltepress/vite'
  import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit'
  import type { BundledLanguage } from 'shiki/langs'

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

  export interface DefaultThemeOptions {
    navbar?: Array<LinkItem>
    github?: string
    logo?: string
    sidebar?: Record<string, LinkItem[]>
    editLink?: string
    discord?: string
    ga?: string
    pwa?: SvelteKitPWAOptions & {
      darkManifest?: string
    }
    docsearch?: {
      appId: string
      apiKey: string
      indexName: string
    }
    themeColor?: {
      light: string
      dark: string
      primary?: string
      hover?: string
      gradient?: {
        start: string
        end: string
      }
    }
    highlighter?: {
      languages?: BundledLanguage[]
      themeLight?: string
      themeDark?: string
      twoslash?: boolean | CreateTwoslashSvelteOptions
    }
    i18n?: {
      onThisPage?: string
      suggestChangesToThisPage?: string
      lastUpdateAt?: string
      previousPage?: string
      nextPage?: string
      expansionTitle?: string
      pwa?: {
        tip?: string
        reload?: string
        close?: string
        appReadyToWorkOffline?: string
        newContentAvailable?: string
      }
      footnoteLabel?: string
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
