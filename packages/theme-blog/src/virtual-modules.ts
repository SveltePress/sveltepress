import type { ParsedPost } from './parse-post.js'
import { buildIndex } from './build-index.js'

export interface VirtualModules {
  metaModule: string
  postModule: (slug: string) => string | null
  tagsIndexModule: string
  tagModule: (name: string) => string | null
  categoriesIndexModule: string
  categoryModule: (name: string) => string | null
  /** Per-slug records for writing JSON files to disk (consumed by +page.server.ts loads). */
  postRecordBySlug: Record<string, unknown>
  /** Per-tag post lists, keyed by tag name. Written to disk for tag server loads. */
  postsByTag: Record<string, unknown>
  /** Per-category post lists, keyed by category name. Written to disk for category server loads. */
  postsByCategory: Record<string, unknown>
}

export function buildVirtualModules(parsedPosts: ParsedPost[]): VirtualModules {
  const idx = buildIndex(parsedPosts)

  const postRecordBySlug: Record<string, unknown> = {}
  for (const p of idx.posts)
    postRecordBySlug[p.slug] = p

  return {
    metaModule: `export const posts = ${JSON.stringify(idx.meta)}`,
    postModule: (slug) => {
      const record = postRecordBySlug[slug]
      if (!record)
        return null
      return `export const post = ${JSON.stringify(record)}`
    },
    tagsIndexModule: `export const tags = ${JSON.stringify(idx.tagCounts)}`,
    tagModule: (name) => {
      const posts = idx.tagPosts[name]
      return posts ? `export const posts = ${JSON.stringify(posts)}` : null
    },
    categoriesIndexModule: `export const categories = ${JSON.stringify(idx.categoryCounts)}`,
    categoryModule: (name) => {
      const posts = idx.categoryPosts[name]
      return posts ? `export const posts = ${JSON.stringify(posts)}` : null
    },
    postRecordBySlug,
    postsByTag: idx.tagPosts,
    postsByCategory: idx.categoryPosts,
  }
}
