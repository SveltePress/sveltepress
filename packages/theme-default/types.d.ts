/// <reference types="vite/client" />
declare module 'virtual:sveltepress/theme-default' {
  import type { LoadTheme } from '@sveltepress/vite'
  import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit'

  export interface WithTitle {
    title: string
  }

  export interface LinkItem extends WithTitle {
    to: string
    external?: boolean
  }

  export interface LinkGroup extends WithTitle {
    items: (LinkItem | LinkGroup)[]
  }

  type SidebarItem = LinkItem | LinkGroup & {
    collapsible?: boolean
  }
  export interface DefaultThemeOptions {
    navbar: Array<LinkItem | LinkGroup>
    github?: string
    logo?: string
    sidebar?: Record<string, SidebarItem[]>
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
