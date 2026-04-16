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

// Core plugin wraps this with GlobalLayout.svelte.
export const ROOT_LAYOUT = `<script>
  const { children } = $props()
</script>
{@render children?.()}
`

// Home page — paginated list of post meta, server-loaded.
export const LIST_PAGE_SERVER_LOAD = `import { posts } from 'virtual:sveltepress/blog-posts-meta'
import { blogConfig } from 'virtual:sveltepress/blog-config'

export const prerender = true

export function load() {
  const pageSize = blogConfig.pageSize ?? 12
  return {
    posts: posts.slice(0, pageSize),
    total: posts.length,
    pageSize,
    page: 1,
  }
}
`

export const LIST_PAGE = `<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import Pagination from '@sveltepress/theme-blog/components/Pagination.svelte'
  const { data } = $props()
  const posts = $derived(data.posts)
</script>
<MasonryGrid {posts} />
<Pagination page={data.page} total={data.total} pageSize={data.pageSize} />
`

// /page/[n]/ — Nth page of the paginated list.
export const PAGE_N_SERVER_LOAD = `import { posts } from 'virtual:sveltepress/blog-posts-meta'
import { blogConfig } from 'virtual:sveltepress/blog-config'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  const pageSize = blogConfig.pageSize ?? 12
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  // Page 1 is served at /, not /page/1/. Start enumerating from 2.
  const out = []
  for (let i = 2; i <= totalPages; i++) out.push({ n: String(i) })
  return out
}

export function load({ params }) {
  const pageSize = blogConfig.pageSize ?? 12
  const n = Number(params.n)
  if (!Number.isInteger(n) || n < 1) error(404, 'Bad page number')
  const start = (n - 1) * pageSize
  const slice = posts.slice(start, start + pageSize)
  if (slice.length === 0) error(404, 'Page out of range')
  return { posts: slice, total: posts.length, pageSize, page: n }
}
`

export const PAGE_N_PAGE = LIST_PAGE // same component, different load

// Post page — reads per-slug JSON from disk. The vite plugin writes these
// during buildStart to .sveltepress/posts/<slug>.json because SvelteKit's
// prerender can't reliably resolve virtual modules through dynamic import()
// with template-string slugs.
export const POST_PAGE_SERVER_LOAD = `import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { posts } from 'virtual:sveltepress/blog-posts-meta'
import { postsJsonDir } from 'virtual:sveltepress/blog-runtime'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function load({ params }) {
  try {
    const file = join(postsJsonDir, \`\${params.slug}.json\`)
    const post = JSON.parse(await readFile(file, 'utf-8'))
    const idx = posts.findIndex(p => p.slug === params.slug)
    return { post, prev: posts[idx + 1] ?? null, next: posts[idx - 1] ?? null }
  } catch {
    error(404, 'Post not found')
  }
}
`

export const POST_PAGE = `<script lang="ts">
  import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte'
  const { data } = $props()
  const post = $derived(data.post)
  const prev = $derived(data.prev)
  const next = $derived(data.next)
</script>
<PostLayout {post} {prev} {next} />
`

// Tag page — reads per-tag JSON from disk. Same reason as POST_PAGE: prerender
// runs the server bundle via Node, which can't resolve virtual: URL schemes
// that dynamic import() produces for template-string params.
export const TAG_PAGE_SERVER_LOAD = `import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tags } from 'virtual:sveltepress/blog-tags-index'
import { tagsJsonDir } from 'virtual:sveltepress/blog-runtime'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return tags.map(t => ({ tag: t.name }))
}

export async function load({ params }) {
  try {
    const file = join(tagsJsonDir, \`\${encodeURIComponent(params.tag)}.json\`)
    const posts = JSON.parse(await readFile(file, 'utf-8'))
    if (!posts.length) error(404, 'Tag not found')
    return { tag: params.tag, posts }
  } catch {
    error(404, 'Tag not found')
  }
}
`

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

// Category page — mirrors tag page.
export const CAT_PAGE_SERVER_LOAD = `import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { categories } from 'virtual:sveltepress/blog-categories-index'
import { categoriesJsonDir } from 'virtual:sveltepress/blog-runtime'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return categories.map(c => ({ cat: c.name }))
}

export async function load({ params }) {
  try {
    const file = join(categoriesJsonDir, \`\${encodeURIComponent(params.cat)}.json\`)
    const posts = JSON.parse(await readFile(file, 'utf-8'))
    if (!posts.length) error(404, 'Category not found')
    return { category: params.cat, posts }
  } catch {
    error(404, 'Category not found')
  }
}
`

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

// Timeline — uses the meta list (no content needed for timeline rendering).
export const TIMELINE_PAGE = `<script lang="ts">
  import Timeline from '@sveltepress/theme-blog/components/Timeline.svelte'
  import { posts } from 'virtual:sveltepress/blog-posts-meta'
</script>
<Timeline {posts} />
`

// Tags index — uses the pre-computed count list (no posts needed here).
export const TAGS_INDEX_PAGE = `<script lang="ts">
  import { tags } from 'virtual:sveltepress/blog-tags-index'
</script>
<div class="sp-tags-page">
  <h1 class="sp-tags-page__title">All Tags</h1>
  <div class="sp-tags-page__grid">
    {#each tags as { name, count }}
      <a href="/tags/{name}/" class="sp-tag-pill">
        #{name} <span class="sp-tag-pill__count">{count}</span>
      </a>
    {/each}
  </div>
</div>
<style>
  .sp-tags-page { padding: 2rem 0; }
  .sp-tags-page__title { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--sp-blog-text, #fff7ed); }
  .sp-tags-page__grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .sp-tag-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: var(--sp-blog-surface, #2d1200);
    border: 1px solid var(--sp-blog-border, #3f1c04);
    color: var(--sp-blog-primary, #fb923c);
    padding: 0.4rem 0.9rem; border-radius: 9999px;
    font-size: 0.875rem; transition: background 0.2s;
  }
  .sp-tag-pill:hover { background: var(--sp-blog-border, #3f1c04); text-decoration: none; }
  .sp-tag-pill__count { color: var(--sp-blog-muted, #a16207); font-size: 0.8rem; }
</style>
`
