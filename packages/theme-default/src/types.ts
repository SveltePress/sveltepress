import type { Plugin } from 'unified'
export interface WithTitle {
  title: string
}

export interface NavbarItem extends WithTitle {
  to: string
}

export interface NavbarGroup {
  title: string
  items: (NavbarItem | NavbarGroup)[]
}

export interface DefaultThemeOptions {
  navbar: Array<NavbarItem | NavbarGroup>
  github?: string
  logo?: string
}

export type RemarkLiveCode = Plugin<[], any>
