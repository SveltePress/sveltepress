import type { sveltekit } from '@sveltejs/kit/vite'
import type { BundledLanguage } from 'shiki/langs'
import type { Plugin } from 'unified'
import type { PluginOption } from 'vite'

/**
 * The options accepted by SvelteKit's `sveltekit()` vite plugin.
 *
 * On the newer SvelteKit project layout there is no `svelte.config.js` and all
 * config (`compilerOptions`, `adapter`, ...) is passed inline to `sveltekit()`
 * in `vite.config.ts`. Forward those options through `sveltepress()` so the
 * standalone `sveltekit()` plugin can be removed (having both crashes the dev
 * server with duplicated Svelte compilation).
 */
export type SvelteKitOptions = Parameters<typeof sveltekit>[0]

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
  /** Receive the core version configuration before theme plugins are resolved. */
  configureVersions?: (versions: VersionPluginOptions) => void
}

export type VersionPluginOptions = SveltepressVitePluginOptions['versions']

export type RemarkPluginsOrderer = ((themeRemarkPlugins: Plugin[]) => Plugin[])

export type RehypePluginsOrderer = ((themeRehypePlugins: Plugin[]) => Plugin[])

export interface PageInfo {
  title: string
  routePath: string
  content: string
  frontmatter: Record<string, unknown>
}

/**
 * A single locale of a multi-locale site. Keyed by its URL prefix (`'/'` for
 * the default locale, `'/zh/'`, `'/bn/'`, ...).
 */
export interface LocaleConfig<ThemeOptions = any> {
  /** BCP 47 language tag, e.g. `'en'`, `'zh-CN'`, `'bn'`. */
  lang: string
  /** User-facing label rendered in the language switcher. */
  label: string
  /** The locale's full theme options. */
  theme: ThemeOptions
  /**
   * Logical routes available in this locale (no locale prefix). Populated by
   * the core plugin from the routes directory; only needed explicitly when
   * constructing configs directly.
   */
  routes?: string[]
}

/** Multi-locale site configuration keyed by URL prefix. */
export type LocalesConfig<ThemeOptions = any> = Record<string, LocaleConfig<ThemeOptions>>

/** A locale resolved from a route: the locale config plus its matched prefix. */
export interface ResolvedLocale<ThemeOptions = any> extends LocaleConfig<ThemeOptions> {
  /** The locale's URL prefix, e.g. `'/'`, `'/zh/'`. */
  prefix: string
}

/** The target of a locale switch. */
export interface LocaleSwitchTarget {
  href: string
  /** Whether the target locale lacks the logical page and the href falls back to its home. */
  fallback: boolean
}

export interface LlmsConfig {
  enabled?: boolean
  title?: string
  description?: string
  baseUrl?: string
  routesDir?: string
  filter?: (filePath: string, frontmatter: Record<string, unknown>) => boolean
  sort?: (a: PageInfo, b: PageInfo) => number
}

export interface SveltepressVitePluginOptions {
  theme?: ResolvedTheme
  siteConfig?: SiteConfig
  addInspect?: boolean
  remarkPlugins?: Plugin[] | RemarkPluginsOrderer
  rehypePlugins?: Plugin[] | RehypePluginsOrderer
  llms?: LlmsConfig
  /**
   * Multi-locale site configuration keyed by URL prefix (`'/'` for the default
   * locale, `'/zh/'`, `'/bn/'`, ...). Each entry carries that locale's `lang`,
   * a user-facing `label` for the switcher, and its full theme options.
   *
   * When omitted the site stays single-locale and behavior is unchanged.
   */
  locales?: LocalesConfig
  /**
   * Enable document version management by discovering
   * `sveltepress.versions.json`, override its location, or disable discovery.
   */
  versions?: false | {
    manifest?: string
  }
  /**
   * Options forwarded to the SvelteKit vite plugin that `sveltepress()` sets up
   * internally.
   *
   * Use this on the newer SvelteKit layout (no `svelte.config.js`, config passed
   * inline to `sveltekit()`) to move your `compilerOptions`, `adapter`, etc. into
   * `sveltepress()` and remove the standalone `sveltekit()` plugin. `'.md'` is
   * always added to `extensions` automatically.
   *
   * When omitted, SvelteKit reads its config from `svelte.config.js` as before.
   */
  svelteKitOptions?: SvelteKitOptions
  /**
   * Options for Pagefind static local search indexing.
   * Set to `false` to disable automatic post-build indexing.
   */
  pagefind?: boolean | import('./pagefind.js').PagefindOptions
}

export type LoadTheme<ThemeOptions = any> = (themeOptions?: ThemeOptions) => ResolvedTheme

export type RawRemarkPlugin = Plugin<any[], any> | [Plugin<any[], any>, any]

export type AcceptableRemarkPlugin = Array<RawRemarkPlugin>
