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
  highlighter: Highlighter
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
  /**
   * Used for unocss safelist
   * Need this when some of the markdown styles would not parsed by unocss.
   */
  safelist?: string[]

  /**
   * Client imports would be added to the global layout script scope
   */
  clientImports?: Array<`import '${string}'`>
}
export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
}

export type LoadTheme<ThemeOptions = any> = (themeOptions?: ThemeOptions) => ResolvedTheme
