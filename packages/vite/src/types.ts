import type { MdsvexOptions } from 'mdsvex'
import type { Plugin } from 'unified'

export type RemarkLiveCode = Plugin<[], any>
export interface Options {
  mdsvexOptions?: MdsvexOptions
}

export interface Frontmatter {
  title?: string
  description?: string
}

export type Highlighter = (code: string, lang?: string) => Promise<string>

export interface SiteConfig {
  title?: string
  description?: string
}
export interface ResolvedTheme {
  name: string
  globalLayout: string
  pageLayout: string
}
export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
}

export type LoadTheme = <ThemeOptions extends any[]>(...args: ThemeOptions) => ResolvedTheme
