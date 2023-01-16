declare module "virtual:sveltepress/theme-default" {
  export interface WithTitle {
    title: string
  }

  export interface LinkItem extends WithTitle {
    to: string
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
    docsearch?: {
      appId: string,
      apiKey: string,
      indexName: string
    }
  }
  
  const options: DefaultThemeOptions
  export default options
}