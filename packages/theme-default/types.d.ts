declare module 'virtual:sveltepress/theme-default' {
  import type { LoadTheme } from '@svelte-press/vite'

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
  export interface DefaultThemeOptions {
    navbar: Array<LinkItem | LinkGroup>
    github?: string
    logo?: string
    sidebar?: Record<string, (LinkItem | LinkGroup)[]>
    editLink?: string
    discord?: string
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
