import type { BundledLanguage } from 'shiki/langs'
import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'

export type RemarkLiveCode = Plugin<[], any>

export type Highlighter = (code: string, lang: BundledLanguage, meta?: string) => string | Promise<string>

export interface SiteConfig {
  title?: string
  description?: string
}
export interface ResolvedTheme {
  name: string
  globalLayout: string
  pageLayout: string
  vitePlugins: PluginOption | ((corePlugin: PluginOption) => PluginOption[])
  highlighter: Highlighter
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
  /**
   * The footnote label used for [remark rehype](https://github.com/remarkjs/remark-rehype#api)
   */
  footnoteLabel?: string
}

export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
}

export type LoadTheme<ThemeOptions = any> = (themeOptions?: ThemeOptions) => ResolvedTheme
