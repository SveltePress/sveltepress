/// <reference types="vite/client" />
/// <reference types="@sveltepress/vite/types" />

declare module 'virtual:sveltepress/theme-default' {
  import type { LoadTheme } from '@sveltepress/vite'
  import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit'

  export interface WithTitle {
    title: string
  }

  export interface LinkItem extends WithTitle {
    to?: string
    external?: boolean
    collapsible?: boolean
    items?: LinkItem[]
  }

  export interface DefaultThemeOptions {
    navbar: Array<LinkItem>
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
    highlighter: {
      languages: string[]
      themeLight: string
      themeDark: string
    }
  }
  export type ThemeDefault = LoadTheme<DefaultThemeOptions>

  const options: DefaultThemeOptions
  export default options
}
