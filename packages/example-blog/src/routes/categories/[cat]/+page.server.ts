import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { error } from '@sveltejs/kit'
import { categories } from 'virtual:sveltepress/blog-categories-index'
import { categoriesJsonDir } from 'virtual:sveltepress/blog-runtime'

export const prerender = true

export function entries() {
  return categories.map(c => ({ cat: c.name }))
}

export async function load({ params }) {
  try {
    const file = join(categoriesJsonDir, `${encodeURIComponent(params.cat)}.json`)
    const posts = JSON.parse(await readFile(file, 'utf-8'))
    if (!posts.length)
      error(404, 'Category not found')
    return { category: params.cat, posts }
  }
  catch {
    error(404, 'Category not found')
  }
}
