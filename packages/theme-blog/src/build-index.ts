import type { ParsedPost } from './parse-post.js'
import type { PostIndex } from './types.js'

export function buildIndex(parsedPosts: ParsedPost[]): PostIndex {
  const posts = parsedPosts
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))

  const tags: Record<string, typeof posts> = {}
  const categories: Record<string, typeof posts> = {}

  for (const post of posts) {
    for (const tag of post.tags) {
      tags[tag] ??= []
      tags[tag].push(post)
    }
    if (post.category) {
      categories[post.category] ??= []
      categories[post.category].push(post)
    }
  }

  return { posts, tags, categories }
}

/** Generate the JS string for a virtual module. */
export function toVirtualModuleCode(index: PostIndex): {
  postsModule: string
  tagsModule: string
  categoriesModule: string
} {
  const postsModule = `export const posts = ${JSON.stringify(index.posts)}`
  const tagsModule = `export const tags = ${JSON.stringify(index.tags)}`
  const categoriesModule = `export const categories = ${JSON.stringify(index.categories)}`
  return { postsModule, tagsModule, categoriesModule }
}
