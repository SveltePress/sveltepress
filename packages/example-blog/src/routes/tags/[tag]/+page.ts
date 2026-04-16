import { tags } from 'virtual:sveltepress/blog-tags'

export function load({ params }) {
  return { tag: params.tag, posts: tags[params.tag] ?? [] }
}
