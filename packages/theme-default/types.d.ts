/// <reference types="vite/client" />
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
    pwa?: SvelteKitPWAOptions
    docsearch?: {
      appId: string
      apiKey: string
      indexName: string
    }
  }
  export type ThemeDefault = LoadTheme<DefaultThemeOptions>

  const options: DefaultThemeOptions
  export default options
}
