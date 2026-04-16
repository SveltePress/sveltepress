import type { ParsedPost } from './parse-post.js'
import type { BlogPostMeta, PostIndex } from './types.js'

function toMeta(p: ParsedPost): BlogPostMeta {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    cover: p.cover,
    tags: p.tags,
    category: p.category,
    excerpt: p.excerpt,
    author: p.author,
    readingTime: p.readingTime,
  }
}

export function buildIndex(parsedPosts: ParsedPost[]): PostIndex {
  const posts = parsedPosts
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))

  const meta = posts.map(toMeta)
  const metaBySlug: Record<string, BlogPostMeta> = {}
  for (const m of meta)
    metaBySlug[m.slug] = m

  const tagPosts: Record<string, BlogPostMeta[]> = {}
  const categoryPosts: Record<string, BlogPostMeta[]> = {}
  for (const m of meta) {
    for (const t of m.tags) {
      tagPosts[t] ??= []
      tagPosts[t].push(m)
    }
    if (m.category) {
      categoryPosts[m.category] ??= []
      categoryPosts[m.category].push(m)
    }
  }

  const tagCounts = Object.entries(tagPosts)
    .map(([name, ms]) => ({ name, count: ms.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const categoryCounts = Object.entries(categoryPosts)
    .map(([name, ms]) => ({ name, count: ms.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return { posts, meta, metaBySlug, tagCounts, tagPosts, categoryCounts, categoryPosts }
}

/** Temporary shim — T3 will rewrite vite-plugin to consume the split index directly. */
export function toVirtualModuleCode(index: PostIndex): {
  postsModule: string
  tagsModule: string
  categoriesModule: string
} {
  return {
    postsModule: `export const posts = ${JSON.stringify(index.posts)}`,
    tagsModule: `export const tags = ${JSON.stringify(index.tagPosts)}`,
    categoriesModule: `export const categories = ${JSON.stringify(index.categoryPosts)}`,
  }
}
