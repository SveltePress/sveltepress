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
}

export interface ThemeColor {
  primary?: string // default '#fb923c'
  secondary?: string // default '#dc2626'
  bg?: string // default '#1a0a00'
  surface?: string // default '#2d1200'
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
  author?: string
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
}

export interface PostIndex {
  posts: BlogPost[]
  tags: Record<string, BlogPost[]>
  categories: Record<string, BlogPost[]>
}

export const DEFAULT_THEME_COLOR: Required<ThemeColor> = {
  primary: '#fb923c',
  secondary: '#dc2626',
  bg: '#1a0a00',
  surface: '#2d1200',
}
