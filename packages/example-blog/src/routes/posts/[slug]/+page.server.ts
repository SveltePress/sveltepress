import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { error } from '@sveltejs/kit'
import { posts } from 'virtual:sveltepress/blog-posts-meta'
import { postsJsonDir } from 'virtual:sveltepress/blog-runtime'

export const prerender = true

export function entries() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function load({ params }) {
  try {
    const file = join(postsJsonDir, `${params.slug}.json`)
    const post = JSON.parse(await readFile(file, 'utf-8'))
    const idx = posts.findIndex(p => p.slug === params.slug)
    return { post, prev: posts[idx + 1] ?? null, next: posts[idx - 1] ?? null }
  }
  catch {
    error(404, 'Post not found')
  }
}
