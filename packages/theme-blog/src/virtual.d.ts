declare module 'virtual:sveltepress/blog-posts-meta' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-post/*' {
  import type { BlogPost } from '@sveltepress/theme-blog'

  export const post: BlogPost | null
}

declare module 'virtual:sveltepress/blog-tags-index' {
  export const tags: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-tag/*' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-categories-index' {
  export const categories: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-category/*' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-config' {
  import type { BlogThemeOptions } from '@sveltepress/theme-blog'

  export const blogConfig: BlogThemeOptions
}

declare module 'virtual:sveltepress/blog-runtime' {
  /**
   * Absolute path to the per-slug JSON cache directory, resolved from
   * vite's config.root at build time. Import from server loads to avoid
   * process.cwd() divergence.
   */
  export const postsJsonDir: string
}
