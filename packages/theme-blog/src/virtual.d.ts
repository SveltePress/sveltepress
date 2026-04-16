declare module 'virtual:sveltepress/blog-posts-meta' {
  import type { BlogPostMeta } from './types.js'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-post/*' {
  import type { BlogPost } from './types.js'

  export const post: BlogPost | null
}

declare module 'virtual:sveltepress/blog-tags-index' {
  export const tags: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-tag/*' {
  import type { BlogPostMeta } from './types.js'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-categories-index' {
  export const categories: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-category/*' {
  import type { BlogPostMeta } from './types.js'

  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-config' {
  import type { BlogThemeOptions } from './types.js'

  export const blogConfig: BlogThemeOptions
}
