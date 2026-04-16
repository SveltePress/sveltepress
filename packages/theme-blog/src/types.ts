export interface BlogPost {
  slug: string
  title: string
  date: string // ISO string, e.g. "2026-04-10"
  cover?: string
  tags: string[]
  category?: string
  excerpt: string // first 120 chars of body text if not in frontmatter
  author?: string
  readingTime: number // minutes, rounded up
  /** Pre-rendered HTML from the markdown body. Must be from a trusted source — rendered via {@html} in templates. */
  contentHtml: string
}

export interface ThemeColor {
  primary?: string // default '#fb923c'
  secondary?: string // default '#dc2626'
  bg?: string // default '#1a0a00'
  surface?: string // default '#2d1200'
}

export interface BlogThemeOptions {
  title: string
  description?: string
  base?: string
  author?: string
  themeColor?: ThemeColor
  postsDir?: string // default 'src/posts'
  pageSize?: number // default 12
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
