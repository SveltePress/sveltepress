declare module "sveltepress:theme-default" {
  export interface WithTitle {
    title: string
  }

  export interface LinkItem extends WithTitle {
    to: string
  }

  export interface LinkGroup {
    title: string
    items: (LinkItem | LinkGroup)[]
  }

  export interface DefaultThemeOptions {
    navbar: Array<LinkItem | LinkGroup>
    github?: string
    logo?: string
    sidebar?: Record<string, (LinkItem | LinkGroup)[]>
  }
  export interface DefaultThemeOptions {
    navbar: Array<LinkItem | LinkGroup>
    github?: string
    logo?: string
    sidebar?: Record<string, (LinkItem | LinkGroup)[]>
  }

  const options: DefaultThemeOptions
  export default options
}