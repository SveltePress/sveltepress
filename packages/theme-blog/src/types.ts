/** Lightweight metadata for listings. Ships in bundles; must stay small. */
export interface BlogPostMeta {
  slug: string
  title: string
  date: string // ISO string, e.g. "2026-04-10"
  cover?: string
  tags: string[]
  category?: string
  excerpt: string
  author?: string
  readingTime: number
}

/** Full post including rendered HTML. Loaded per-slug, never bundled in lists. */
export interface BlogPost extends BlogPostMeta {
  /** Pre-rendered HTML from the markdown body. Rendered via {@html} in templates. */
  contentHtml: string
  /** Up to N meta entries sharing tags/category/year with this post. */
  related?: BlogPostMeta[]
}

export interface ThemeColor {
  primary?: string // default '#fb923c'
  secondary?: string // default '#dc2626'
  bg?: string // default '#1a0a00'
  surface?: string // default '#2d1200'
}

export interface AuthorSocials {
  /** GitHub username (no @). */
  github?: string
  /** Twitter/X username (no @). */
  twitter?: string
  /** Full Mastodon profile URL. */
  mastodon?: string
  /** Bluesky handle, e.g. 'name.bsky.social'. */
  bluesky?: string
  email?: string
  /** Full URL. */
  website?: string
  /** Full URL; defaults to `/rss.xml` if omitted. */
  rss?: string
}

export interface AuthorProfile {
  name: string
  /** Absolute URL or `/`-prefixed path to an image in `static/`. */
  avatar?: string
  bio?: string
  socials?: AuthorSocials
}

export interface GiscusConfig {
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  reactionsEnabled?: boolean
  inputPosition?: 'top' | 'bottom'
  lang?: string
}

export interface AboutConfig {
  /** Rendered below the AuthorProfile block. Accepts raw HTML. */
  html?: string
}

export interface OgImageConfig {
  /** Default true. Set false to skip generation entirely. */
  enabled?: boolean
  /** Absolute path to a TTF/OTF/WOFF font. Defaults to @fontsource/inter (Bold 700). */
  fontPath?: string
  /** Site-wide tagline below the title. Defaults to `description`. */
  tagline?: string
}

export interface HighlighterOptions {
  /** Shiki dark theme name. Default: `'night-owl'` */
  themeDark?: string
  /** Shiki light theme name. Default: `'vitesse-light'` */
  themeLight?: string
  /** Extra languages to load (merged with defaults). */
  languages?: string[]
  /** Enable Twoslash TypeScript hover info. Uses plain HTML renderer (works in {@html}). Default: false */
  twoslash?: boolean
}

export interface BlogThemeOptions {
  title: string
  description?: string
  base?: string
  /**
   * Site-wide author identity. Rendered as AuthorCard at the bottom of posts
   *  and AuthorProfile on the About page.
   */
  author?: AuthorProfile
  themeColor?: ThemeColor
  themeColorLight?: ThemeColor // custom light mode overrides
  postsDir?: string // default 'src/posts'
  pageSize?: number // default 12
  defaultMode?: 'system' | 'dark' | 'light' // default 'system'
  /** Shiki syntax highlighter configuration. */
  highlighter?: HighlighterOptions
  rss?: {
    enabled?: boolean
    limit?: number
    copyright?: string
  }
  search?: 'docsearch' | 'meilisearch' | false
  navbar?: Array<{ title: string, to: string }>
  /**
   * Giscus comments configuration. If set, `/about/+page.svelte` is
   *  scaffolded and GiscusComments is rendered below each post.
   */
  giscus?: GiscusConfig
  /** About page content. If set, `/about/+page.svelte` is scaffolded. */
  about?: AboutConfig
  /** Auto-generated Open Graph images. Defaults to enabled. */
  ogImage?: OgImageConfig
}

export interface PostIndex {
  /** All non-draft posts, sorted desc by date. Keeps full content (for per-slug lookup). */
  posts: BlogPost[]
  /** Meta-only list (no contentHtml) for list/timeline/pagination pages. */
  meta: BlogPostMeta[]
  /** Meta-only lookup by slug. */
  metaBySlug: Record<string, BlogPostMeta>
  /** Aggregate tag counts for tag index page. */
  tagCounts: Array<{ name: string, count: number }>
  /** Meta list for each tag, keyed by tag name. */
  tagPosts: Record<string, BlogPostMeta[]>
  /** Aggregate category counts. */
  categoryCounts: Array<{ name: string, count: number }>
  /** Meta list for each category, keyed by category name. */
  categoryPosts: Record<string, BlogPostMeta[]>
}

export const DEFAULT_THEME_COLOR: Required<ThemeColor> = {
  primary: '#fb923c',
  secondary: '#dc2626',
  bg: '#1a0a00',
  surface: '#2d1200',
}
