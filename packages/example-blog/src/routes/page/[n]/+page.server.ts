import { error } from '@sveltejs/kit'
import { blogConfig } from 'virtual:sveltepress/blog-config'
import { posts } from 'virtual:sveltepress/blog-posts-meta'

export const prerender = true

export function entries() {
  const pageSize = blogConfig.pageSize ?? 12
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  // Page 1 is served at /, not /page/1/. Start enumerating from 2.
  const out = []
  for (let i = 2; i <= totalPages; i++) out.push({ n: String(i) })
  return out
}

export function load({ params }) {
  const pageSize = blogConfig.pageSize ?? 12
  const n = Number(params.n)
  if (!Number.isInteger(n) || n < 1)
    error(404, 'Bad page number')
  const start = (n - 1) * pageSize
  const slice = posts.slice(start, start + pageSize)
  if (slice.length === 0)
    error(404, 'Page out of range')
  return { posts: slice, total: posts.length, pageSize, page: n }
}
