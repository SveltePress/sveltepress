import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { error } from '@sveltejs/kit'
import { tagsJsonDir } from 'virtual:sveltepress/blog-runtime'
import { tags } from 'virtual:sveltepress/blog-tags-index'

export const prerender = true

export function entries() {
  return tags.map(t => ({ tag: t.name }))
}

export async function load({ params }) {
  try {
    const file = join(tagsJsonDir, `${encodeURIComponent(params.tag)}.json`)
    const posts = JSON.parse(await readFile(file, 'utf-8'))
    if (!posts.length)
      error(404, 'Tag not found')
    return { tag: params.tag, posts }
  }
  catch {
    error(404, 'Tag not found')
  }
}
