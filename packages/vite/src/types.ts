import type { BundledLanguage } from 'shiki/langs'
import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'

export type RemarkLiveCode = Plugin<[], any>

export type Highlighter = (code: string, lang: BundledLanguage, meta?: string) => string | Promise<string>

export type ThemeVitePlugins = PluginOption[] | ((corePlugin: PluginOption) => Promise<PluginOption[]>) | ((corePlugin: PluginOption) => PluginOption[])

export interface SiteConfig {
  title?: string
  description?: string
}
export interface ResolvedTheme {
  name: string
  globalLayout: string
  pageLayout: string
  vitePlugins: ThemeVitePlugins
  highlighter: Highlighter
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
  /**
   * The footnote label used for [remark rehype](https://github.com/remarkjs/remark-rehype#api)
   */
  footnoteLabel?: string
}

export type RemarkPluginsOrderer = ((themeRemarkPlugins: Plugin[]) => Plugin[])

export type RehypePluginsOrderer = ((themeRehypePlugins: Plugin[]) => Plugin[])

export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
  remarkPlugins?: Plugin[] | RemarkPluginsOrderer
  rehypePlugins?: Plugin[] | RehypePluginsOrderer
}

export type LoadTheme<ThemeOptions = any> = (themeOptions?: ThemeOptions) => ResolvedTheme

export type RawRemarkPlugin = Plugin<any[], any> | [Plugin<any[], any>, any]

export type AcceptableRemarkPlugin = Array<RawRemarkPlugin>
