import { blogConfig } from 'virtual:sveltepress/blog-config'
import { posts } from 'virtual:sveltepress/blog-posts-meta'

export const prerender = true

export function load() {
  const pageSize = blogConfig.pageSize ?? 12
  return {
    posts: posts.slice(0, pageSize),
    total: posts.length,
    pageSize,
    page: 1,
  }
}
