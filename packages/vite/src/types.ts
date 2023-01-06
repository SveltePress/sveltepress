import type { MdsvexOptions } from 'mdsvex'
import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'

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
  vitePlugins?: PluginOption
}
export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
  vitePlugins?: PluginOption
}

export type LoadTheme<ThemeOptions = any> = (themeOptions?: ThemeOptions) => ResolvedTheme
