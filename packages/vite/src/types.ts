import type { MdsvexOptions } from 'mdsvex'
import type { Plugin } from 'unified'

export type Theme = `@svelte-press/theme-${'default' | 'blog'}`

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

export interface SveltepressVitePluginOptions {
  theme?: Theme
  siteConfig?: SiteConfig
  addInspect?: boolean
}
