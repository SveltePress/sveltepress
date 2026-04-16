declare module 'virtual:sveltepress/blog-posts' {
  import type { BlogPost } from './types.js'

  export const posts: BlogPost[]
}

declare module 'virtual:sveltepress/blog-tags' {
  import type { BlogPost } from './types.js'

  export const tags: Record<string, BlogPost[]>
}

declare module 'virtual:sveltepress/blog-categories' {
  import type { BlogPost } from './types.js'

  export const categories: Record<string, BlogPost[]>
}

declare module 'virtual:sveltepress/blog-config' {
  import type { BlogThemeOptions } from './types.js'

  export const blogConfig: BlogThemeOptions
}
