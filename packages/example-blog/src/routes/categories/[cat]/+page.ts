import { categories } from 'virtual:sveltepress/blog-categories'

export function load({ params }) {
  return { category: params.cat, posts: categories[params.cat] ?? [] }
}
