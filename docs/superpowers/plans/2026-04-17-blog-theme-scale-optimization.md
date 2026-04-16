# Blog Theme Scale Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@sveltepress/theme-blog` handle ~1000 posts without bundle bloat, slow builds, or laggy page rendering. Ship search and image optimization as part of the same push.

**Architecture:** Split the single "all posts with HTML" virtual module into (a) one lightweight meta list for listings and (b) per-slug content modules loaded on demand. Move data access from `+page.ts` (bundled into every page's JS) to `+page.server.ts` (baked into prerendered `data.json`, zero runtime JS). Add content-hashed disk cache for `parsePost` so warm builds skip Shiki. Use `content-visibility: auto` for off-screen list items. Integrate Pagefind as a zero-infrastructure static search index.

**Tech Stack:**
- SvelteKit + `@sveltejs/adapter-static` (keep prerender)
- Vite virtual modules (pattern-matched `resolveId`/`load`)
- Shiki 3.x (existing)
- Node `node:crypto` (stdlib, no new deps) for content hashing
- Pagefind (new dep) for search index
- Vitest for tests

**Working directory:** `/Users/zhaodongsheng/my-projects/sveltepress` on branch `feature/theme-blog`. All paths below are relative to the repo root.

**Changeset reminder:** Per `feedback_changeset` memory, run `pnpm changeset` before committing each phase that introduces a user-facing change. Each phase below calls this out.

---

## Phase 1 — Bundle Split (highest impact)

The single largest scalability bottleneck. Without this, every route ships ~50 MB of inlined HTML to the browser.

### Task 1: Split `BlogPost` into `BlogPostMeta` + `BlogPost`

**Files:**
- Modify: `packages/theme-blog/src/types.ts`
- Modify: `packages/theme-blog/src/parse-post.ts`
- Modify: `packages/theme-blog/__tests__/parse-post.test.ts`

- [ ] **Step 1: Update the test fixture to use the new type split**

```typescript
// packages/theme-blog/__tests__/parse-post.test.ts — top of file
import type { BlogPostMeta } from '../src/types.js'
// ... existing imports
```

Then add a new test near the bottom of the `describe('parsePost', ...)` block:

```typescript
it('returns a post whose meta shape matches BlogPostMeta', async () => {
  const post = await parsePost('x', '---\ntitle: T\ndate: 2026-04-10\n---\nbody')
  const meta: BlogPostMeta = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    cover: post.cover,
    tags: post.tags,
    category: post.category,
    excerpt: post.excerpt,
    author: post.author,
    readingTime: post.readingTime,
  }
  expect(meta.slug).toBe('x')
  // contentHtml must be present only on the full BlogPost, not the meta
  expect('contentHtml' in meta).toBe(false)
})
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `cd packages/theme-blog && pnpm vitest run parse-post`
Expected: TypeScript error "Cannot find name 'BlogPostMeta'" — compile fails before tests execute.

- [ ] **Step 3: Refactor `types.ts` to split the type**

Replace the existing `BlogPost` declaration (lines 1–13) with:

```typescript
/** Lightweight metadata for listings. Ships in bundles; must stay small. */
export interface BlogPostMeta {
  slug: string
  title: string
  date: string // ISO string, e.g. "2026-04-10"
  cover?: string
  tags: string[]
  category?: string
  excerpt: string
  author?: string
  readingTime: number
}

/** Full post including rendered HTML. Loaded per-slug, never bundled in lists. */
export interface BlogPost extends BlogPostMeta {
  /** Pre-rendered HTML from the markdown body. Rendered via {@html} in templates. */
  contentHtml: string
}
```

- [ ] **Step 4: Run tests again to confirm pass**

Run: `cd packages/theme-blog && pnpm vitest run parse-post`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/types.ts packages/theme-blog/__tests__/parse-post.test.ts
git commit -m "refactor(theme-blog): split BlogPost into BlogPostMeta + BlogPost"
```

---

### Task 2: Refactor `buildIndex` to produce split output

**Files:**
- Modify: `packages/theme-blog/src/build-index.ts`
- Modify: `packages/theme-blog/src/types.ts`
- Modify: `packages/theme-blog/__tests__/build-index.test.ts`

The new index shape:

```typescript
export interface PostIndex {
  /** All non-draft posts, sorted desc by date. Keeps full content (for per-slug lookup). */
  posts: ParsedPost[]
  /** Meta-only list (no contentHtml) for list/timeline/pagination pages. */
  meta: BlogPostMeta[]
  /** Meta-only lookup by slug. */
  metaBySlug: Record<string, BlogPostMeta>
  /** Aggregate tag counts for tag index page. */
  tagCounts: Array<{ name: string, count: number }>
  /** Meta list for each tag, keyed by tag name. */
  tagPosts: Record<string, BlogPostMeta[]>
  /** Aggregate category counts. */
  categoryCounts: Array<{ name: string, count: number }>
  categoryPosts: Record<string, BlogPostMeta[]>
}
```

- [ ] **Step 1: Update `build-index.test.ts` with new assertions**

Replace the `describe('buildIndex', ...)` block's contents with:

```typescript
describe('buildIndex', () => {
  it('excludes draft posts', () => {
    const posts = [makePost({ draft: true }), makePost({ slug: 'pub', draft: false })]
    const index = buildIndex(posts)
    expect(index.posts).toHaveLength(1)
    expect(index.meta).toHaveLength(1)
    expect(index.meta[0].slug).toBe('pub')
  })

  it('sorts by date desc in both posts and meta', () => {
    const posts = [
      makePost({ slug: 'older', date: '2026-03-01' }),
      makePost({ slug: 'newer', date: '2026-04-10' }),
    ]
    const index = buildIndex(posts)
    expect(index.posts[0].slug).toBe('newer')
    expect(index.meta[0].slug).toBe('newer')
  })

  it('strips contentHtml from meta entries', () => {
    const posts = [makePost({ slug: 'a', contentHtml: '<p>big html</p>' })]
    const index = buildIndex(posts)
    expect('contentHtml' in index.meta[0]).toBe(false)
    expect(index.posts[0].contentHtml).toBe('<p>big html</p>')
  })

  it('builds metaBySlug for O(1) slug lookup', () => {
    const posts = [makePost({ slug: 'a' }), makePost({ slug: 'b' })]
    const index = buildIndex(posts)
    expect(index.metaBySlug.a.slug).toBe('a')
    expect(index.metaBySlug.b.slug).toBe('b')
  })

  it('builds tagCounts sorted desc by count', () => {
    const posts = [
      makePost({ slug: 'a', tags: ['x', 'y'] }),
      makePost({ slug: 'b', tags: ['x'] }),
      makePost({ slug: 'c', tags: ['x'] }),
    ]
    const index = buildIndex(posts)
    expect(index.tagCounts[0]).toEqual({ name: 'x', count: 3 })
    expect(index.tagCounts[1]).toEqual({ name: 'y', count: 1 })
  })

  it('tagPosts stores meta only (no contentHtml)', () => {
    const posts = [makePost({ slug: 'a', tags: ['x'], contentHtml: '<p>big</p>' })]
    const index = buildIndex(posts)
    expect('contentHtml' in index.tagPosts.x[0]).toBe(false)
  })

  it('categoryCounts mirror tagCounts shape', () => {
    const posts = [
      makePost({ slug: 'a', category: 'Eng' }),
      makePost({ slug: 'b', category: 'Eng' }),
    ]
    const index = buildIndex(posts)
    expect(index.categoryCounts[0]).toEqual({ name: 'Eng', count: 2 })
  })
})
```

Remove the old `toVirtualModuleCode` test — the function will change signature in Task 3.

- [ ] **Step 2: Run tests to confirm they fail**

Run: `cd packages/theme-blog && pnpm vitest run build-index`
Expected: FAIL — `index.meta`, `index.metaBySlug`, `index.tagCounts`, etc. are undefined.

- [ ] **Step 3: Rewrite `build-index.ts`**

Replace the entire file with:

```typescript
import type { ParsedPost } from './parse-post.js'
import type { BlogPostMeta, PostIndex } from './types.js'

function toMeta(p: ParsedPost): BlogPostMeta {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    cover: p.cover,
    tags: p.tags,
    category: p.category,
    excerpt: p.excerpt,
    author: p.author,
    readingTime: p.readingTime,
  }
}

export function buildIndex(parsedPosts: ParsedPost[]): PostIndex {
  const posts = parsedPosts
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))

  const meta = posts.map(toMeta)
  const metaBySlug: Record<string, BlogPostMeta> = {}
  for (const m of meta) metaBySlug[m.slug] = m

  const tagPosts: Record<string, BlogPostMeta[]> = {}
  const categoryPosts: Record<string, BlogPostMeta[]> = {}
  for (const m of meta) {
    for (const t of m.tags) {
      tagPosts[t] ??= []
      tagPosts[t].push(m)
    }
    if (m.category) {
      categoryPosts[m.category] ??= []
      categoryPosts[m.category].push(m)
    }
  }

  const tagCounts = Object.entries(tagPosts)
    .map(([name, ms]) => ({ name, count: ms.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const categoryCounts = Object.entries(categoryPosts)
    .map(([name, ms]) => ({ name, count: ms.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return { posts, meta, metaBySlug, tagCounts, tagPosts, categoryCounts, categoryPosts }
}
```

- [ ] **Step 4: Update `types.ts`**

Replace the existing `PostIndex` declaration with the one shown above (in the Task 2 header).

- [ ] **Step 5: Run tests to confirm pass**

Run: `cd packages/theme-blog && pnpm vitest run build-index`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/theme-blog/src/build-index.ts packages/theme-blog/src/types.ts packages/theme-blog/__tests__/build-index.test.ts
git commit -m "refactor(theme-blog): split build-index output into meta + full posts"
```

---

### Task 3: Dynamic per-slug virtual modules

**Files:**
- Modify: `packages/theme-blog/src/vite-plugin.ts`
- Modify: `packages/theme-blog/src/virtual.d.ts`
- Create: `packages/theme-blog/__tests__/vite-plugin-virtual.test.ts`

The new virtual module layout:

| ID | Contents |
|----|----------|
| `virtual:sveltepress/blog-posts-meta` | `export const posts: BlogPostMeta[]` |
| `virtual:sveltepress/blog-post/<slug>` | `export const post: BlogPost` |
| `virtual:sveltepress/blog-tags-index` | `export const tags: Array<{ name, count }>` |
| `virtual:sveltepress/blog-tag/<name>` | `export const posts: BlogPostMeta[]` |
| `virtual:sveltepress/blog-categories-index` | `export const categories: Array<{ name, count }>` |
| `virtual:sveltepress/blog-category/<name>` | `export const posts: BlogPostMeta[]` |
| `virtual:sveltepress/blog-config` | unchanged |

Pattern-matched resolution: slugs/names are URL-encoded in the suffix so any character set is safe.

- [ ] **Step 1: Write the failing test for virtual module generation**

Create `packages/theme-blog/__tests__/vite-plugin-virtual.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { buildVirtualModules } from '../src/virtual-modules.js'

const makePost = (slug: string, extra: any = {}) => ({
  slug,
  title: slug,
  date: '2026-04-10',
  tags: extra.tags ?? [],
  category: extra.category,
  excerpt: 'x',
  readingTime: 1,
  contentHtml: `<p>${slug}</p>`,
  draft: false,
  ...extra,
})

describe('virtual module generation', () => {
  it('emits meta module without contentHtml', () => {
    const modules = buildVirtualModules([makePost('a')])
    expect(modules.metaModule).toContain('"slug":"a"')
    expect(modules.metaModule).not.toContain('contentHtml')
  })

  it('emits per-slug post module with contentHtml', () => {
    const modules = buildVirtualModules([makePost('a')])
    const m = modules.postModule('a')
    expect(m).toContain('<p>a</p>')
    expect(m).toContain('"slug":"a"')
  })

  it('returns null for unknown slug', () => {
    const modules = buildVirtualModules([makePost('a')])
    expect(modules.postModule('missing')).toBeNull()
  })

  it('emits per-tag meta module', () => {
    const modules = buildVirtualModules([makePost('a', { tags: ['x'] })])
    expect(modules.tagModule('x')).toContain('"slug":"a"')
    expect(modules.tagModule('unknown')).toBeNull()
  })

  it('tags-index module is sorted by count desc', () => {
    const modules = buildVirtualModules([
      makePost('a', { tags: ['x', 'y'] }),
      makePost('b', { tags: ['x'] }),
    ])
    expect(modules.tagsIndexModule).toMatch(/"name":"x","count":2.*"name":"y","count":1/)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd packages/theme-blog && pnpm vitest run vite-plugin-virtual`
Expected: FAIL — `virtual-modules.js` does not exist.

- [ ] **Step 3: Create `virtual-modules.ts`**

Create `packages/theme-blog/src/virtual-modules.ts`:

```typescript
import type { ParsedPost } from './parse-post.js'
import { buildIndex } from './build-index.js'

export interface VirtualModules {
  metaModule: string
  postModule: (slug: string) => string | null
  tagsIndexModule: string
  tagModule: (name: string) => string | null
  categoriesIndexModule: string
  categoryModule: (name: string) => string | null
}

export function buildVirtualModules(parsedPosts: ParsedPost[]): VirtualModules {
  const idx = buildIndex(parsedPosts)
  const postBySlug: Record<string, ParsedPost> = {}
  for (const p of idx.posts) postBySlug[p.slug] = p

  return {
    metaModule: `export const posts = ${JSON.stringify(idx.meta)}`,
    postModule: (slug) => {
      const p = postBySlug[slug]
      if (!p) return null
      // Strip the `draft` flag — never expose it at runtime.
      const { draft: _d, ...publicFields } = p
      return `export const post = ${JSON.stringify(publicFields)}`
    },
    tagsIndexModule: `export const tags = ${JSON.stringify(idx.tagCounts)}`,
    tagModule: (name) => {
      const posts = idx.tagPosts[name]
      return posts ? `export const posts = ${JSON.stringify(posts)}` : null
    },
    categoriesIndexModule: `export const categories = ${JSON.stringify(idx.categoryCounts)}`,
    categoryModule: (name) => {
      const posts = idx.categoryPosts[name]
      return posts ? `export const posts = ${JSON.stringify(posts)}` : null
    },
  }
}
```

- [ ] **Step 4: Run test to confirm pass**

Run: `cd packages/theme-blog && pnpm vitest run vite-plugin-virtual`
Expected: all tests PASS.

- [ ] **Step 5: Rewire `vite-plugin.ts` to use the new virtual modules**

Replace the virtual module constants and `resolveId`/`load` hooks. The resolution pattern: the virtual ID ends with `/<encoded-slug-or-name>` for dynamic modules; extract and decode.

Old constants at the top of `vite-plugin.ts` (lines 12–22) are replaced with:

```typescript
const V_META = 'virtual:sveltepress/blog-posts-meta'
const V_POST_PREFIX = 'virtual:sveltepress/blog-post/'
const V_TAGS_INDEX = 'virtual:sveltepress/blog-tags-index'
const V_TAG_PREFIX = 'virtual:sveltepress/blog-tag/'
const V_CATS_INDEX = 'virtual:sveltepress/blog-categories-index'
const V_CAT_PREFIX = 'virtual:sveltepress/blog-category/'
const V_CONFIG = 'virtual:sveltepress/blog-config'
```

The `rebuildIndex` function stores the `VirtualModules` object in a closure:

```typescript
let modules: VirtualModules | null = null

async function rebuildIndex(root: string) {
  const postsDir = resolve(root, options.postsDir ?? 'src/posts')
  let files: string[] = []
  try { files = (await readdir(postsDir)).filter(f => f.endsWith('.md')) }
  catch { /* postsDir missing is fine */ }

  const parsed = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(join(postsDir, file), 'utf-8')
      const slug = file.replace(/\.md$/, '')
      return parsePost(slug, raw)
    }),
  )

  modules = buildVirtualModules(parsed)
  return parsed
}
```

Replace `resolveId` and `load` with pattern-matched versions:

```typescript
resolveId(id) {
  if (id === V_META || id === V_TAGS_INDEX || id === V_CATS_INDEX || id === V_CONFIG)
    return `\0${id}`
  if (id.startsWith(V_POST_PREFIX) || id.startsWith(V_TAG_PREFIX) || id.startsWith(V_CAT_PREFIX))
    return `\0${id}`
},

load(id) {
  if (!id.startsWith('\0')) return
  const key = id.slice(1)
  if (key === V_CONFIG) return `export const blogConfig = ${JSON.stringify(options)}`
  if (!modules) return 'export {}'
  if (key === V_META) return modules.metaModule
  if (key === V_TAGS_INDEX) return modules.tagsIndexModule
  if (key === V_CATS_INDEX) return modules.categoriesIndexModule
  if (key.startsWith(V_POST_PREFIX))
    return modules.postModule(decodeURIComponent(key.slice(V_POST_PREFIX.length))) ?? 'export const post = null'
  if (key.startsWith(V_TAG_PREFIX))
    return modules.tagModule(decodeURIComponent(key.slice(V_TAG_PREFIX.length))) ?? 'export const posts = []'
  if (key.startsWith(V_CAT_PREFIX))
    return modules.categoryModule(decodeURIComponent(key.slice(V_CAT_PREFIX.length))) ?? 'export const posts = []'
},
```

Update the HMR invalidation in `configureServer` to walk all matching modules:

```typescript
const handlePostChange = async (file: string) => {
  if (!file.startsWith(postsDir + sep)) return
  await rebuildIndex(config.root)
  const toInvalidate = Array.from(server.moduleGraph.idToModuleMap.keys())
    .filter(id => id.startsWith('\0virtual:sveltepress/blog-'))
  toInvalidate.forEach((id) => {
    const mod = server.moduleGraph.getModuleById(id)
    if (mod) server.moduleGraph.invalidateModule(mod)
  })
  server.ws.send({ type: 'full-reload' })
}
```

Also drop the top-level `postsModule`/`tagsModule`/`categoriesModule` variables (the new `modules` closure replaces them).

- [ ] **Step 6: Update `virtual.d.ts`**

Replace the file contents with:

```typescript
declare module 'virtual:sveltepress/blog-posts-meta' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'
  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-post/*' {
  import type { BlogPost } from '@sveltepress/theme-blog'
  export const post: BlogPost | null
}

declare module 'virtual:sveltepress/blog-tags-index' {
  export const tags: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-tag/*' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'
  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-categories-index' {
  export const categories: Array<{ name: string, count: number }>
}

declare module 'virtual:sveltepress/blog-category/*' {
  import type { BlogPostMeta } from '@sveltepress/theme-blog'
  export const posts: BlogPostMeta[]
}

declare module 'virtual:sveltepress/blog-config' {
  import type { BlogThemeOptions } from '@sveltepress/theme-blog'
  export const blogConfig: BlogThemeOptions
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/theme-blog/src/virtual-modules.ts packages/theme-blog/src/vite-plugin.ts packages/theme-blog/src/virtual.d.ts packages/theme-blog/__tests__/vite-plugin-virtual.test.ts
git commit -m "feat(theme-blog): split virtual modules into meta + per-slug/tag/cat content"
```

---

### Task 4: Rewrite scaffolded route templates to use server loads

**Files:**
- Modify: `packages/theme-blog/src/route-templates.ts`
- Modify: `packages/theme-blog/src/scaffold.ts`

SvelteKit + adapter-static + prerender: `+page.server.ts` loads run at build time and the result is baked into `data.json`. The client bundle for the route contains zero post data — only what `+page.svelte` references.

- [ ] **Step 1: Replace `LIST_PAGE_LOAD`, `POST_PAGE_LOAD`, `TAG_PAGE_LOAD`, `CAT_PAGE_LOAD` with server variants**

Replace the existing templates in `route-templates.ts` with the block below. Note the filename switch: `+page.ts` → `+page.server.ts`.

```typescript
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

// Reads the per-slug JSON file the Vite plugin writes on buildStart
// (see Task 3, Step 5b). This avoids Vite's dynamic-import-of-virtual-module
// limitations — plain fs.readFile always works under SSR/prerender on Node.
export const POST_PAGE_SERVER_LOAD = `import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { posts } from 'virtual:sveltepress/blog-posts-meta'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function load({ params }) {
  try {
    const file = resolve(process.cwd(), '.sveltepress/posts', \`\${params.slug}.json\`)
    const post = JSON.parse(await readFile(file, 'utf-8'))
    const idx = posts.findIndex(p => p.slug === params.slug)
    return { post, prev: posts[idx + 1] ?? null, next: posts[idx - 1] ?? null }
  } catch {
    error(404, 'Post not found')
  }
}
`

export const TAG_PAGE_SERVER_LOAD = `import { tags } from 'virtual:sveltepress/blog-tags-index'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return tags.map(t => ({ tag: t.name }))
}

export async function load({ params }) {
  const mod = await import(\`virtual:sveltepress/blog-tag/\${encodeURIComponent(params.tag)}\`)
  if (!mod.posts.length) error(404, 'Tag not found')
  return { tag: params.tag, posts: mod.posts }
}
`

export const CAT_PAGE_SERVER_LOAD = `import { categories } from 'virtual:sveltepress/blog-categories-index'
import { error } from '@sveltejs/kit'

export const prerender = true

export function entries() {
  return categories.map(c => ({ cat: c.name }))
}

export async function load({ params }) {
  const mod = await import(\`virtual:sveltepress/blog-category/\${encodeURIComponent(params.cat)}\`)
  if (!mod.posts.length) error(404, 'Category not found')
  return { category: params.cat, posts: mod.posts }
}
`
```

Also remove the old `LIST_PAGE`, `POST_PAGE_LOAD`, `TAG_PAGE_LOAD`, `CAT_PAGE_LOAD` exports — the Svelte `+page.svelte` files already access `data` from `load`, so the client templates don't need to change. But rename the list page template to consume `data.posts`:

```typescript
export const LIST_PAGE = `<script lang="ts">
  import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte'
  import Pagination from '@sveltepress/theme-blog/components/Pagination.svelte'
  const { data } = $props()
  const posts = $derived(data.posts)
</script>
<MasonryGrid {posts} />
<Pagination page={data.page} total={data.total} pageSize={data.pageSize} />
`

export const PAGE_N_PAGE = LIST_PAGE // same component, different load
```

(The `Pagination` component is created in Task 5.)

- [ ] **Step 2: Update `scaffold.ts` to write `.server.ts` + handle old-path migration**

Replace the contents of `scaffoldRoutes` with:

```typescript
import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  CAT_PAGE,
  CAT_PAGE_SERVER_LOAD,
  LIST_PAGE,
  LIST_PAGE_SERVER_LOAD,
  PAGE_N_PAGE,
  PAGE_N_SERVER_LOAD,
  POST_PAGE,
  POST_PAGE_SERVER_LOAD,
  ROOT_LAYOUT,
  ROOT_LAYOUT_TS,
  TAG_PAGE,
  TAG_PAGE_SERVER_LOAD,
  TAGS_INDEX_PAGE,
  TIMELINE_PAGE,
} from './route-templates.js'

interface ScaffoldFile { path: string, content: string }

/** Paths that earlier versions of theme-blog created; remove if present to
 * avoid dual-route conflicts with the new .server.ts layout. */
const LEGACY_PATHS = [
  'src/routes/posts/[slug]/+page.ts',
  'src/routes/tags/[tag]/+page.ts',
  'src/routes/categories/[cat]/+page.ts',
]

function scaffoldFiles(root: string): ScaffoldFile[] {
  const r = (p: string) => join(root, 'src', 'routes', p)
  return [
    { path: r('+layout.ts'), content: ROOT_LAYOUT_TS },
    { path: r('+layout.svelte'), content: ROOT_LAYOUT },
    { path: r('+page.server.ts'), content: LIST_PAGE_SERVER_LOAD },
    { path: r('+page.svelte'), content: LIST_PAGE },
    { path: r('page/[n]/+page.server.ts'), content: PAGE_N_SERVER_LOAD },
    { path: r('page/[n]/+page.svelte'), content: PAGE_N_PAGE },
    { path: r('posts/[slug]/+page.server.ts'), content: POST_PAGE_SERVER_LOAD },
    { path: r('posts/[slug]/+page.svelte'), content: POST_PAGE },
    { path: r('tags/+page.svelte'), content: TAGS_INDEX_PAGE },
    { path: r('tags/[tag]/+page.server.ts'), content: TAG_PAGE_SERVER_LOAD },
    { path: r('tags/[tag]/+page.svelte'), content: TAG_PAGE },
    { path: r('categories/[cat]/+page.server.ts'), content: CAT_PAGE_SERVER_LOAD },
    { path: r('categories/[cat]/+page.svelte'), content: CAT_PAGE },
    { path: r('timeline/+page.svelte'), content: TIMELINE_PAGE },
  ]
}

export async function scaffoldRoutes(root: string): Promise<void> {
  for (const legacy of LEGACY_PATHS) {
    const p = join(root, legacy)
    if (existsSync(p)) {
      await rm(p)
      console.warn(`[theme-blog] removed legacy scaffold file ${legacy}`)
    }
  }
  for (const file of scaffoldFiles(root)) {
    if (existsSync(file.path)) continue
    await mkdir(join(file.path, '..'), { recursive: true })
    await writeFile(file.path, file.content, 'utf-8')
    console.warn(`[theme-blog] scaffolded ${file.path.replace(root, '')}`)
  }
}
```

Also make sure `LIST_PAGE_SERVER_LOAD` is listed in the exports and re-exported from `route-templates.ts`.

- [ ] **Step 3: Rebuild theme-blog and verify example-blog still renders**

```bash
cd packages/theme-blog && pnpm build
cd ../example-blog
# Restart dev server (the user must do this manually — parse-post module is cached)
```

- [ ] **Step 4: Verify with agent-browser**

```bash
agent-browser open http://localhost:36739/
agent-browser snapshot -i
# Expect the home page to render 12 posts (pageSize default)

agent-browser open http://localhost:36739/posts/hello-sveltepress/
agent-browser snapshot -i
# Expect the post to render with full content
```

- [ ] **Step 5: Inspect the client bundle — confirm contentHtml is NOT shipped to list routes**

```bash
cd packages/example-blog && pnpm build 2>&1 | tail -20
# After build: grep the built JS for a known post contentHtml snippet
grep -l "Welcome to the" packages/example-blog/build/_app/immutable/**/*.js || echo "OK — content not in list bundles"
```

Expected: the grep should only find a match in the `posts/<slug>` page chunk, not in the home or tags page chunks.

- [ ] **Step 6: Commit**

```bash
git add packages/theme-blog/src/route-templates.ts packages/theme-blog/src/scaffold.ts
git commit -m "feat(theme-blog): move route loads to +page.server.ts and remove content from list bundles"
```

---

### Task 5: Pagination component + `/page/[n]/` route

**Files:**
- Create: `packages/theme-blog/src/components/Pagination.svelte`
- Modify: `packages/theme-blog/package.json` (add component export)
- Modify: `packages/theme-blog/src/types.ts` — document `pageSize` (already present)
- Modify: `packages/theme-blog/__tests__/pagination.test.ts` (new file)

- [ ] **Step 1: Write a failing test for the pagination number strip**

Create `packages/theme-blog/__tests__/pagination.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { paginationWindow } from '../src/pagination.js'

describe('paginationWindow', () => {
  it('returns all numbers when total pages ≤ 7', () => {
    expect(paginationWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows ellipsis near the end', () => {
    expect(paginationWindow(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20])
  })

  it('shows ellipsis near the start', () => {
    expect(paginationWindow(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20])
  })

  it('shows ellipses on both sides when in middle', () => {
    expect(paginationWindow(10, 20)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20])
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `cd packages/theme-blog && pnpm vitest run pagination`
Expected: FAIL — `pagination.js` missing.

- [ ] **Step 3: Implement `pagination.ts`**

Create `packages/theme-blog/src/pagination.ts`:

```typescript
export function paginationWindow(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const windowStart = Math.max(2, current - 2)
  const windowEnd = Math.min(total - 1, current + 2)
  const result: Array<number | '…'> = [1]
  if (windowStart > 2) result.push('…')
  for (let i = windowStart; i <= windowEnd; i++) result.push(i)
  if (windowEnd < total - 1) result.push('…')
  result.push(total)
  return result
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `cd packages/theme-blog && pnpm vitest run pagination`
Expected: all PASS.

- [ ] **Step 5: Create the `Pagination.svelte` component**

Create `packages/theme-blog/src/components/Pagination.svelte`:

```svelte
<script lang="ts">
  import { paginationWindow } from '../pagination.js'

  interface Props {
    page: number
    total: number
    pageSize: number
  }

  const { page, total, pageSize }: Props = $props()
  const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)))
  const items = $derived(paginationWindow(page, totalPages))

  function href(n: number) {
    return n === 1 ? '/' : `/page/${n}/`
  }
</script>

{#if totalPages > 1}
  <nav class="sp-pg" aria-label="Pagination">
    {#if page > 1}
      <a class="sp-pg__nav" href={href(page - 1)}>← Prev</a>
    {/if}
    {#each items as it}
      {#if it === '…'}
        <span class="sp-pg__sep">…</span>
      {:else}
        <a
          class="sp-pg__num"
          class:is-active={it === page}
          href={href(it)}
          aria-current={it === page ? 'page' : undefined}
        >{it}</a>
      {/if}
    {/each}
    {#if page < totalPages}
      <a class="sp-pg__nav" href={href(page + 1)}>Next →</a>
    {/if}
  </nav>
{/if}

<style>
  .sp-pg { display: flex; gap: 0.35rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0; font-size: 0.875rem; }
  .sp-pg__num, .sp-pg__nav {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 2rem; height: 2rem; padding: 0 0.6rem;
    border: 1px solid var(--sp-blog-border); border-radius: 6px;
    color: var(--sp-blog-content); text-decoration: none;
    background: var(--sp-blog-surface);
    transition: border-color 0.15s, color 0.15s;
  }
  .sp-pg__num:hover, .sp-pg__nav:hover { border-color: var(--sp-blog-primary); color: var(--sp-blog-primary); }
  .sp-pg__num.is-active {
    background: var(--sp-blog-primary); border-color: var(--sp-blog-primary); color: var(--sp-blog-bg); font-weight: 700;
  }
  .sp-pg__sep { padding: 0 0.3rem; color: var(--sp-blog-muted); }
</style>
```

- [ ] **Step 6: Export from `package.json`**

Inside `packages/theme-blog/package.json`, add to `exports`:

```json
"./components/Pagination.svelte": {
  "types": "./dist/components/Pagination.svelte.d.ts",
  "import": "./dist/components/Pagination.svelte",
  "svelte": "./dist/components/Pagination.svelte"
}
```

- [ ] **Step 7: Changeset + commit**

```bash
pnpm changeset
# Select theme-blog, minor, message: "Add pagination, split virtual modules for scale"
git add packages/theme-blog packages/theme-blog/__tests__ .changeset/*.md
git commit -m "feat(theme-blog): add pagination component and /page/[n]/ route"
```

---

## Phase 2 — Build Cache

### Task 6: Disk cache for `parsePost`

**Files:**
- Create: `packages/theme-blog/src/parse-cache.ts`
- Create: `packages/theme-blog/__tests__/parse-cache.test.ts`
- Modify: `packages/theme-blog/src/vite-plugin.ts`

Goal: second build should skip Shiki for unchanged files. Cache key = sha256(raw_md + JSON.stringify(highlighterConfig)).

Cache location: `<project-root>/.sveltepress/cache/blog-posts.json`. One file for all posts (avoids FS churn). Loaded once on `buildStart`, written once after `rebuildIndex`.

- [ ] **Step 1: Write the failing test**

Create `packages/theme-blog/__tests__/parse-cache.test.ts`:

```typescript
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hashContent, loadCache, saveCache } from '../src/parse-cache.js'

let dir: string

beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'svp-cache-')) })
afterEach(() => { rmSync(dir, { recursive: true, force: true }) })

describe('parse-cache', () => {
  it('produces stable hash for same content+config', () => {
    const h1 = hashContent('abc', { twoslash: true })
    const h2 = hashContent('abc', { twoslash: true })
    expect(h1).toBe(h2)
  })

  it('hash differs when config changes', () => {
    const h1 = hashContent('abc', { twoslash: true })
    const h2 = hashContent('abc', { twoslash: false })
    expect(h1).not.toBe(h2)
  })

  it('roundtrips cache entries', async () => {
    await saveCache(dir, { 'a': { hash: 'h1', parsed: { slug: 'a' } as any } })
    const loaded = await loadCache(dir)
    expect(loaded.a.hash).toBe('h1')
  })

  it('returns empty object when cache file absent', async () => {
    const loaded = await loadCache(dir)
    expect(loaded).toEqual({})
  })

  it('returns empty on malformed JSON', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(join(dir, '.sveltepress/cache'), { recursive: true })
    await writeFile(join(dir, '.sveltepress/cache/blog-posts.json'), '{not json')
    const loaded = await loadCache(dir)
    expect(loaded).toEqual({})
  })
})
```

- [ ] **Step 2: Run to confirm failure**

Run: `cd packages/theme-blog && pnpm vitest run parse-cache`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `parse-cache.ts`**

Create `packages/theme-blog/src/parse-cache.ts`:

```typescript
import type { ParsedPost } from './parse-post.js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CACHE_DIR = '.sveltepress/cache'
const CACHE_FILE = 'blog-posts.json'

export interface CacheEntry {
  hash: string
  parsed: ParsedPost
}

export type Cache = Record<string, CacheEntry>

export function hashContent(raw: string, config: unknown): string {
  return createHash('sha256')
    .update(raw)
    .update('\0')
    .update(JSON.stringify(config ?? null))
    .digest('hex')
}

export async function loadCache(root: string): Promise<Cache> {
  try {
    const text = await readFile(join(root, CACHE_DIR, CACHE_FILE), 'utf-8')
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object') return obj as Cache
  }
  catch { /* missing or malformed — start fresh */ }
  return {}
}

export async function saveCache(root: string, cache: Cache): Promise<void> {
  const dir = join(root, CACHE_DIR)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, CACHE_FILE), JSON.stringify(cache), 'utf-8')
}
```

- [ ] **Step 4: Run tests to confirm pass**

Run: `cd packages/theme-blog && pnpm vitest run parse-cache`
Expected: all PASS.

- [ ] **Step 5: Wire cache into `vite-plugin.ts`**

Update `rebuildIndex` in `packages/theme-blog/src/vite-plugin.ts`:

```typescript
import { hashContent, loadCache, saveCache } from './parse-cache.js'
import type { Cache } from './parse-cache.js'

let cache: Cache = {}

async function rebuildIndex(root: string) {
  const postsDir = resolve(root, options.postsDir ?? 'src/posts')
  let files: string[] = []
  try { files = (await readdir(postsDir)).filter(f => f.endsWith('.md')) }
  catch { /* no posts dir yet */ }

  const next: Cache = {}
  const parsed = await Promise.all(files.map(async (file) => {
    const raw = await readFile(join(postsDir, file), 'utf-8')
    const slug = file.replace(/\.md$/, '')
    const hash = hashContent(raw, options.highlighter)
    const existing = cache[slug]
    if (existing && existing.hash === hash) {
      next[slug] = existing
      return existing.parsed
    }
    const p = await parsePost(slug, raw)
    next[slug] = { hash, parsed: p }
    return p
  }))

  cache = next
  await saveCache(root, cache)
  modules = buildVirtualModules(parsed)
  return parsed
}
```

And in `buildStart`, load the cache before the first call:

```typescript
async buildStart() {
  await initHighlighter(options.highlighter)
  await scaffoldRoutes(config.root)
  cache = await loadCache(config.root)
  // ... existing app.html injection ...
  const parsed = await rebuildIndex(config.root)
  // ... existing RSS generation ...
}
```

- [ ] **Step 6: Add `.sveltepress/cache/` to `.gitignore` in example-blog**

Append to `packages/example-blog/.gitignore` (create if missing):

```
.sveltepress/
```

- [ ] **Step 7: Verify cold vs warm build timing**

```bash
cd packages/example-blog
rm -rf .sveltepress/cache
time pnpm build   # cold — records baseline
time pnpm build   # warm — should be noticeably faster, ideally 2-5x
```

- [ ] **Step 8: Commit**

```bash
git add packages/theme-blog/src/parse-cache.ts packages/theme-blog/src/vite-plugin.ts packages/theme-blog/__tests__/parse-cache.test.ts packages/example-blog/.gitignore
pnpm changeset  # theme-blog, minor, "Add disk cache for parse-post"
git add .changeset/*.md
git commit -m "feat(theme-blog): cache parsed posts on disk, skip Shiki on unchanged files"
```

---

## Phase 3 — Runtime Performance

### Task 7: `content-visibility: auto` for lists

**Files:**
- Modify: `packages/theme-blog/src/components/Timeline.svelte`
- Modify: `packages/theme-blog/src/components/MasonryGrid.svelte`

`content-visibility: auto` lets the browser skip rendering off-screen elements. Combined with `contain-intrinsic-size` (to reserve space) this is effectively free virtualization.

- [ ] **Step 1: Patch Timeline items**

In `Timeline.svelte`, find the `.sp-tl__item` rule in the `<style>` block and add:

```css
.sp-tl__item {
  /* existing rules ... */
  content-visibility: auto;
  contain-intrinsic-size: auto 180px; /* approximate rendered height */
}
```

- [ ] **Step 2: Patch MasonryGrid cards**

In `MasonryGrid.svelte`, locate the card class (check the file — likely `.sp-masonry__item` or similar). Add the same two properties with an appropriate intrinsic size (~280px for cards with cover images).

- [ ] **Step 3: Verify rendering did not regress**

```bash
cd packages/theme-blog && pnpm build
agent-browser open http://localhost:36739/timeline/
agent-browser snapshot -i
# Expect all posts to appear in the accessibility tree (content-visibility: auto
# preserves a11y, unlike display:none)
```

- [ ] **Step 4: Commit**

```bash
git add packages/theme-blog/src/components/Timeline.svelte packages/theme-blog/src/components/MasonryGrid.svelte
git commit -m "perf(theme-blog): content-visibility: auto on list items"
```

---

### Task 8: Lazy-load cover images with CLS-safe sizing

**Files:**
- Modify: `packages/theme-blog/src/components/PostHero.svelte`
- Modify: `packages/theme-blog/src/components/PostCardFeatured.svelte`
- Modify: `packages/theme-blog/src/components/PostCardLarge.svelte`
- Modify: `packages/theme-blog/src/components/PostCardSmall.svelte`

The covers are external URLs (e.g., picsum), so we cannot use `@sveltejs/enhanced-img` without local files. The wins available now: `loading="lazy"` + `decoding="async"` + aspect-ratio reservation.

- [ ] **Step 1: Update PostCardFeatured — replace the cover `<img>` or CSS background**

In each card, locate any `<img>` referencing `post.cover` and add attributes:

```svelte
<img
  src={post.cover}
  alt={post.title}
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
/>
```

For CSS-background-based heroes (check `PostHero.svelte`), add an explicit aspect ratio to the `.sp-post-hero` rule:

```css
.sp-post-hero { aspect-ratio: 16 / 7; min-height: 0; }
```

(Only the hero is typically above the fold; leave it without `loading="lazy"` to avoid LCP regression, but keep `decoding="async"`.)

- [ ] **Step 2: Visually verify no cumulative layout shift**

```bash
agent-browser open http://localhost:36739/
agent-browser eval "(() => { const po = new PerformanceObserver(list => list.getEntries().forEach(e => console.log('LS:', e.value))); po.observe({type:'layout-shift', buffered: true}); return 'observing — reload to measure' })()"
# Then reload the page and check console for layout-shift values > 0.1
```

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/PostHero.svelte packages/theme-blog/src/components/PostCardFeatured.svelte packages/theme-blog/src/components/PostCardLarge.svelte packages/theme-blog/src/components/PostCardSmall.svelte
git commit -m "perf(theme-blog): lazy-load cover images with explicit dimensions"
```

---

## Phase 4 — Search

Pagefind ships a tiny client bundle and a pre-indexed static `/_pagefind/` directory. It runs post-build against the output HTML — no server required.

### Task 9: Pagefind build integration

**Files:**
- Modify: `pnpm-workspace.yaml` — add `pagefind` to catalog
- Modify: `packages/theme-blog/package.json` — add as peer/optional dep
- Modify: `packages/example-blog/package.json` — add as devDep, wire build script
- Document: `packages/theme-blog/README.md` (create if missing) — explain opt-in

- [ ] **Step 1: Add pagefind to catalog**

In `pnpm-workspace.yaml`, add to the `catalog:` block (alphabetical):

```yaml
  pagefind: ^1.3.0
```

- [ ] **Step 2: Install in example-blog**

```bash
cd packages/example-blog
pnpm add -D pagefind@catalog:
```

- [ ] **Step 3: Update example-blog build script**

In `packages/example-blog/package.json`, modify the `build` script:

```json
"build": "vite build && pagefind --site build"
```

- [ ] **Step 4: Run the build and verify index exists**

```bash
cd packages/example-blog && pnpm build
ls build/_pagefind/pagefind.js && echo "✓ index generated"
```

Expected output: the `pagefind.js` file exists. The index size should be ~100–500KB for 1000 posts.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml packages/example-blog/package.json pnpm-lock.yaml
git commit -m "build(example-blog): integrate pagefind post-build indexer"
```

---

### Task 10: `SearchModal` component + navbar trigger

**Files:**
- Create: `packages/theme-blog/src/components/SearchModal.svelte`
- Modify: `packages/theme-blog/src/components/Navbar.svelte`
- Modify: `packages/theme-blog/src/components/GlobalLayout.svelte`
- Modify: `packages/theme-blog/package.json` — export SearchModal

Design:
- Cmd+K / Ctrl+K opens the modal (also a click target in the navbar)
- Lazy-load pagefind on first open via `import('/_pagefind/pagefind.js')`
- Debounced 200ms search; render top 10 results with highlighted excerpt
- Arrow keys navigate; Enter opens; Esc closes

- [ ] **Step 1: Create `SearchModal.svelte`**

Create `packages/theme-blog/src/components/SearchModal.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    open: boolean
    onClose: () => void
  }

  const { open, onClose }: Props = $props()

  let query = $state('')
  let results: Array<{ url: string, meta: any, excerpt: string }> = $state([])
  let selected = $state(0)
  let pagefind: any = $state(null)
  let loading = $state(false)
  let input: HTMLInputElement | undefined = $state()

  async function ensureLoaded() {
    if (pagefind) return
    loading = true
    try {
      // Path is site-absolute; Pagefind places its runtime at /_pagefind/
      // @ts-expect-error — runtime virtual import
      pagefind = await import(/* @vite-ignore */ '/_pagefind/pagefind.js')
      await pagefind.init()
    }
    finally { loading = false }
  }

  let timer: any
  $effect(() => {
    if (!open) return
    ensureLoaded()
    input?.focus()
  })

  async function runSearch(q: string) {
    if (!pagefind || !q) { results = []; return }
    const search = await pagefind.search(q)
    const top = await Promise.all(search.results.slice(0, 10).map((r: any) => r.data()))
    results = top.map((r: any) => ({ url: r.url, meta: r.meta, excerpt: r.excerpt }))
    selected = 0
  }

  function onInput(e: Event) {
    query = (e.target as HTMLInputElement).value
    clearTimeout(timer)
    timer = setTimeout(() => runSearch(query), 200)
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { selected = Math.min(results.length - 1, selected + 1); e.preventDefault() }
    else if (e.key === 'ArrowUp') { selected = Math.max(0, selected - 1); e.preventDefault() }
    else if (e.key === 'Enter' && results[selected]) { window.location.href = results[selected].url }
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (!open) dispatchEvent(new CustomEvent('sp-search-open'))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })
</script>

{#if open}
  <div class="sp-search-backdrop" onclick={onClose} role="presentation"></div>
  <div class="sp-search" role="dialog" aria-modal="true" aria-label="Search">
    <input
      bind:this={input}
      class="sp-search__input"
      placeholder={loading ? 'Loading…' : 'Search posts…'}
      value={query}
      oninput={onInput}
      onkeydown={onKeydown}
    />
    {#if results.length}
      <ul class="sp-search__results">
        {#each results as r, i}
          <li class="sp-search__item" class:is-selected={i === selected}>
            <a href={r.url}>
              <strong>{r.meta?.title ?? r.url}</strong>
              <!-- pagefind returns already-marked excerpt as HTML -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <p>{@html r.excerpt}</p>
            </a>
          </li>
        {/each}
      </ul>
    {:else if query && !loading}
      <p class="sp-search__empty">No results.</p>
    {/if}
  </div>
{/if}

<style>
  .sp-search-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; }
  .sp-search {
    position: fixed; top: 10vh; left: 50%; transform: translateX(-50%);
    width: min(640px, 92vw); z-index: 101;
    background: var(--sp-blog-surface); border: 1px solid var(--sp-blog-border); border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    display: flex; flex-direction: column; max-height: 70vh;
  }
  .sp-search__input {
    padding: 0.9rem 1rem; background: transparent; border: none; outline: none;
    color: var(--sp-blog-text); font-size: 1rem; border-bottom: 1px solid var(--sp-blog-border);
  }
  .sp-search__results { list-style: none; margin: 0; padding: 0.5rem; overflow: auto; }
  .sp-search__item a { display: block; padding: 0.6rem 0.75rem; border-radius: 6px; color: var(--sp-blog-content); text-decoration: none; }
  .sp-search__item.is-selected a { background: var(--sp-blog-border); color: var(--sp-blog-primary); }
  .sp-search__item p { margin: 0.25rem 0 0; font-size: 0.8rem; color: var(--sp-blog-muted); }
  .sp-search__item :global(mark) { background: var(--sp-blog-primary); color: var(--sp-blog-bg); padding: 0 2px; border-radius: 2px; }
  .sp-search__empty { padding: 1rem; color: var(--sp-blog-muted); text-align: center; }
</style>
```

- [ ] **Step 2: Wire a search button into `Navbar.svelte`**

Add a button in the nav links section that dispatches `sp-search-open`:

```svelte
<button class="sp-nav-search" onclick={() => dispatchEvent(new CustomEvent('sp-search-open'))} aria-label="Search">
  <span>🔍</span> <kbd>⌘K</kbd>
</button>
```

Add a style block entry for `.sp-nav-search` matching the nav aesthetics.

- [ ] **Step 3: Mount the modal in `GlobalLayout.svelte`**

Add import and state:

```svelte
<script lang="ts">
  // ... existing imports
  import SearchModal from './SearchModal.svelte'

  let searchOpen = $state(false)

  $effect(() => {
    const on = () => { searchOpen = true }
    window.addEventListener('sp-search-open', on)
    return () => window.removeEventListener('sp-search-open', on)
  })
</script>

<!-- ... existing markup ... -->
<SearchModal open={searchOpen} onClose={() => (searchOpen = false)} />
```

- [ ] **Step 4: Add the component export**

In `packages/theme-blog/package.json`:

```json
"./components/SearchModal.svelte": {
  "types": "./dist/components/SearchModal.svelte.d.ts",
  "import": "./dist/components/SearchModal.svelte",
  "svelte": "./dist/components/SearchModal.svelte"
}
```

- [ ] **Step 5: Verify locally**

```bash
cd packages/theme-blog && pnpm build
cd ../example-blog && pnpm build   # generates /_pagefind/
pnpm preview
agent-browser open http://localhost:4173/
agent-browser find role button click --name "Search"
agent-browser fill 'input.sp-search__input' "shiki"
# Wait 300ms then snapshot — expect at least one result
agent-browser snapshot -i
```

- [ ] **Step 6: Changeset + commit**

```bash
pnpm changeset  # theme-blog, minor, "Add Pagefind-based search modal"
git add packages/theme-blog .changeset/*.md
git commit -m "feat(theme-blog): SearchModal component with Pagefind integration"
```

---

## Verification Checklist (after all phases)

Run once all tasks are complete:

- [ ] Home page bundle size: `grep -rH "contentHtml" packages/example-blog/build/_app/immutable/nodes/0.*.js` returns nothing — contentHtml appears only in the `posts/[slug]` node chunk.
- [ ] `pnpm build` of example-blog completes in under 90s on warm cache (`rm .sveltepress/cache` then re-run to see cold baseline).
- [ ] Pagefind modal: ⌘K works, typing shows hits, Enter navigates.
- [ ] Pagination works: `/`, `/page/2/`, `/page/3/` are reachable; prev/next links wire correctly.
- [ ] All tests pass: `cd packages/theme-blog && pnpm test` — no regressions in build-index, parse-post, rss, remark-code-blocks, reading-time, pagination, parse-cache, vite-plugin-virtual.
- [ ] Timeline / list scroll remains smooth with 1000 simulated posts (duplicate example posts to 1000 and retest).
- [ ] Lighthouse Performance on home page: ≥ 95.

---

## Notes for implementers

- **theme-blog is a library package**; example-blog imports from `packages/theme-blog/dist/`. After any source change, run `cd packages/theme-blog && pnpm build` and restart the example-blog dev server — HMR does not cross the workspace boundary for compiled artefacts.
- **Do not add prerender sharding** in this plan. Target scale (~1000 posts) fits comfortably in a single SvelteKit prerender pass (~1–3 minutes on CI). Revisit if build time exceeds 5 minutes.
- **Per repo `feedback_changeset` memory:** run `pnpm changeset` before committing phases that introduce user-facing changes (Tasks 5, 6, 10 flagged above).
- **Migration path for existing users:** Task 4's `LEGACY_PATHS` cleanup handles the `.ts` → `.server.ts` transition automatically on first `buildStart` after upgrade. Document in the changeset.
