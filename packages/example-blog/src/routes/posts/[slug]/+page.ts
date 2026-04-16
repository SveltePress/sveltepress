import { error } from '@sveltejs/kit'
import { posts } from 'virtual:sveltepress/blog-posts'

export function load({ params }) {
  const idx = posts.findIndex(p => p.slug === params.slug)
  if (idx === -1)
    error(404, 'Post not found')
  return { post: posts[idx], prev: posts[idx + 1], next: posts[idx - 1] }
}
