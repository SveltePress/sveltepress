// src/route-templates.ts
// IMPORTANT: @sveltepress/vite's core plugin automatically wraps:
//   +layout.svelte  →  with globalLayout  (GlobalLayout.svelte) as <PageLayout {fm}>
//   +page.svelte    →  with pageLayout    (PageLayout.svelte)   as <PageLayout {fm}>
// The import `import PageLayout from '...'` is injected by the core plugin.
// Templates must NOT manually import PageLayout or GlobalLayout to avoid
// "Identifier already declared" errors.

export const ROOT_LAYOUT_TS = `export const prerender = true
export const trailingSlash = 'always'
`

// Core plugin wraps this with GlobalLayout.svelte (as <PageLayout {fm}>).
// Just pass SvelteKit children through.
export const ROOT_LAYOUT = `<script>
  const { children } = $props()
</script>
{@render children?.()}
`

// Core plugin wraps this with PageLayout.svelte (as <PageLayout {fm}>...).
// Only include the page body; PageLayout import is injected automatically.
export const LIST_PAGE = `<script lang="ts">
  import { posts } from 'virtual:sveltepress/blog-posts'
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
</script>
<MasonryGrid {posts} />
`

export const POST_PAGE_LOAD = `import { posts } from 'virtual:sveltepress/blog-posts'
import { error } from '@sveltejs/kit'

export function load({ params }) {
  const idx = posts.findIndex(p => p.slug === params.slug)
  if (idx === -1) error(404, 'Post not found')
  return { post: posts[idx], prev: posts[idx + 1], next: posts[idx - 1] }
}
`

// Core plugin wraps this with PageLayout.svelte.
export const POST_PAGE = `<script lang="ts">
  import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte'
  const { data } = $props()
  const post = $derived(data.post)
  const prev = $derived(data.prev)
  const next = $derived(data.next)
</script>
<PostLayout {post} {prev} {next} />
`

export const TAG_PAGE_LOAD = `import { tags } from 'virtual:sveltepress/blog-tags'

export function load({ params }) {
  return { tag: params.tag, posts: tags[params.tag] ?? [] }
}
`

// Core plugin wraps this with PageLayout.svelte.
export const TAG_PAGE = `<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'
  const { data } = $props()
  const tag = $derived(data.tag)
  const posts = $derived(data.posts)
</script>
<TaxonomyHeader name={tag} count={posts.length} type="tag" />
<MasonryGrid {posts} />
`

export const CAT_PAGE_LOAD = `import { categories } from 'virtual:sveltepress/blog-categories'

export function load({ params }) {
  return { category: params.cat, posts: categories[params.cat] ?? [] }
}
`

// Core plugin wraps this with PageLayout.svelte.
export const CAT_PAGE = `<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'
  const { data } = $props()
  const category = $derived(data.category)
  const posts = $derived(data.posts)
</script>
<TaxonomyHeader name={category} count={posts.length} type="category" />
<MasonryGrid posts={posts} />
`
