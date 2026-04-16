// src/route-templates.ts

export const ROOT_LAYOUT = `<script>
  import GlobalLayout from '@sveltepress/theme-blog/GlobalLayout.svelte'
</script>
<GlobalLayout>
  <slot />
</GlobalLayout>
`

export const LIST_PAGE = `<script lang="ts">
  import { posts } from 'virtual:sveltepress/blog-posts'
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import PageLayout from '@sveltepress/theme-blog/PageLayout.svelte'
</script>
<PageLayout>
  <MasonryGrid {posts} />
</PageLayout>
`

export const POST_PAGE_LOAD = `import { posts } from 'virtual:sveltepress/blog-posts'
import { error } from '@sveltejs/kit'

export function load({ params }) {
  const idx = posts.findIndex(p => p.slug === params.slug)
  if (idx === -1) error(404, 'Post not found')
  return { post: posts[idx], prev: posts[idx + 1], next: posts[idx - 1] }
}
`

export const POST_PAGE = `<script lang="ts">
  import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte'
  const { data } = $props()
  const { post, prev, next } = data
</script>
<PostLayout {post} {prev} {next} />
`

export const TAG_PAGE_LOAD = `import { tags } from 'virtual:sveltepress/blog-tags'

export function load({ params }) {
  return { tag: params.tag, posts: tags[params.tag] ?? [] }
}
`

export const TAG_PAGE = `<script lang="ts">
  import PageLayout from '@sveltepress/theme-blog/PageLayout.svelte'
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'
  export let data
  const { tag, posts } = data
</script>
<PageLayout>
  <TaxonomyHeader name={tag} count={posts.length} type="tag" />
  <MasonryGrid {posts} />
</PageLayout>
`

export const CAT_PAGE_LOAD = `import { categories } from 'virtual:sveltepress/blog-categories'

export function load({ params }) {
  return { category: params.cat, posts: categories[params.cat] ?? [] }
}
`

export const CAT_PAGE = `<script lang="ts">
  import PageLayout from '@sveltepress/theme-blog/PageLayout.svelte'
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte'
  export let data
  const { category, posts } = data
</script>
<PageLayout>
  <TaxonomyHeader name={category} count={posts.length} type="category" />
  <MasonryGrid {posts} />
</PageLayout>
`
