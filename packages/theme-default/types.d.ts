declare module 'virtual:sveltepress/theme-default' {
  import type { LoadTheme } from '@sveltepress/vite'

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
    docsearch?: {
      appId: string
      apiKey: string
      indexName: string
    }
    pwa?: boolean
  }
  export type ThemeDefault = LoadTheme<DefaultThemeOptions>

  const options: DefaultThemeOptions
  export default options
}
