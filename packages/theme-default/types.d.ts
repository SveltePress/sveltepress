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

  export interface BuiltinSearchOptions {
    /**
     * Enable built-in full-text search powered by MiniSearch.
     * @default true
     */
    enabled?: boolean
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
    }
    docsearch?: Omit<DocSearchProps, 'container' | 'theme'>
    search?: Component | string
    builtinSearch?: BuiltinSearchOptions
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
      themeLight?: BundledTheme
      themeDark?: BundledTheme
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

declare module 'virtual:sveltepress/search-index' {
  export interface SearchDocument {
    id: string
    title: string
    href: string
    content: string
    headings: string[]
  }
  export const searchDocuments: SearchDocument[]
}

declare module '@sveltepress/theme-default/context' {
  import type { Writable } from 'svelte/store'

  export interface SveltepressContext {
    isDark: Writable<boolean>
  }
  export const SVELTEPRESS_CONTEXT_KEY: symbol
}
