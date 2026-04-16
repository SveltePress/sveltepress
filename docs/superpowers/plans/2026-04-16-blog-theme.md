# Blog Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@sveltepress/theme-blog` — a standalone Sveltepress blog theme with magazine-style Ember palette, masonry card grid, and zero-config post management via Vite virtual modules.

**Architecture:** A Vite plugin scans `src/posts/*.md`, parses frontmatter with `yaml`, renders markdown to HTML with `unified`/`remark`/`rehype`, and exposes three virtual modules (`blog-posts`, `blog-tags`, `blog-categories`). On first run it scaffolds SvelteKit route files into the user's project. RSS is generated at build time via Vite's `generateBundle` hook. Styling via UnoCSS (consistent with the monorepo).

**Tech Stack:** Svelte 5, SvelteKit, Vite, TypeScript, `yaml` (frontmatter), `unified`+`remark-parse`+`remark-gfm`+`remark-rehype`+`rehype-stringify` (markdown), `shiki` (code highlighting), `unocss` (styles), `fs-extra` (file I/O), Vitest (tests).

**Spec:** `docs/superpowers/specs/2026-04-16-blog-theme-design.md`

---

## File Map

**New files (create):**

```
packages/theme-blog/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                        # exports blogTheme() → ResolvedTheme
│   ├── types.ts                        # BlogPost, BlogThemeOptions interfaces
│   ├── reading-time.ts                 # wordCount → minutes utility
│   ├── parse-post.ts                   # frontmatter + markdown → BlogPost + HTML
│   ├── build-index.ts                  # scan dir → PostIndex (posts/tags/categories)
│   ├── vite-plugin.ts                  # Vite plugin: virtual modules, HMR, scaffolding
│   ├── rss.ts                          # BlogPost[] → RSS 2.0 XML string
│   ├── scaffold.ts                     # writes route files if not present
│   ├── route-templates.ts              # embedded template strings for SvelteKit routes
│   └── components/
│       ├── GlobalLayout.svelte         # outer shell: CSS vars, Navbar slot, UnoCSS reset
│       ├── Navbar.svelte               # logo + nav links + search slot
│       ├── PageLayout.svelte           # list/tag/category page frame
│       ├── PostLayout.svelte           # post detail frame
│       ├── MasonryGrid.svelte          # CSS-columns masonry container
│       ├── PostCardLarge.svelte        # card with cover image
│       ├── PostCardSmall.svelte        # text-only card with left accent bar
│       ├── PostCardFeatured.svelte     # pinned post full-width banner
│       ├── PostHero.svelte             # post title + blurred cover bg
│       ├── TableOfContents.svelte      # floating TOC, scroll-highlighted
│       ├── PostMeta.svelte             # author / date / reading time / tags
│       ├── PostNav.svelte              # prev / next post links
│       └── TaxonomyHeader.svelte       # tag/category name + post count
├── __tests__/
│   ├── reading-time.test.ts
│   ├── parse-post.test.ts
│   ├── build-index.test.ts
│   └── rss.test.ts
```

**Modified files:**
- `pnpm-workspace.yaml` — already includes `packages/**`, no change needed

---

## Task 1: Package scaffolding

**Files:**
- Create: `packages/theme-blog/package.json`
- Create: `packages/theme-blog/tsconfig.json`
- Create: `packages/theme-blog/vitest.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@sveltepress/theme-blog",
  "type": "module",
  "version": "0.0.1",
  "packageManager": "pnpm@10.33.0",
  "description": "A magazine-style blog theme for Sveltepress",
  "author": { "name": "Dongsheng Zhao", "email": "1197160272@qq.com" },
  "license": "MIT",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "svelte": "./dist/index.js"
    },
    "./GlobalLayout.svelte": {
      "types": "./dist/components/GlobalLayout.svelte.d.ts",
      "import": "./dist/components/GlobalLayout.svelte",
      "svelte": "./dist/components/GlobalLayout.svelte"
    },
    "./PageLayout.svelte": {
      "types": "./dist/components/PageLayout.svelte.d.ts",
      "import": "./dist/components/PageLayout.svelte",
      "svelte": "./dist/components/PageLayout.svelte"
    }
  },
  "scripts": {
    "test": "vitest",
    "build:comps": "svelte-package -i src",
    "build": "pnpm build:comps",
    "prepare": "pnpm build"
  },
  "peerDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "catalog:",
    "@sveltepress/vite": "workspace:*",
    "svelte": "^5.0.0",
    "vite": "^7.2.4"
  },
  "dependencies": {
    "fs-extra": "catalog:",
    "rehype-stringify": "catalog:",
    "remark-gfm": "catalog:",
    "remark-parse": "catalog:",
    "remark-rehype": "catalog:",
    "shiki": "catalog:",
    "unocss": "catalog:",
    "@unocss/extractor-svelte": "catalog:",
    "unified": "catalog:",
    "yaml": "catalog:"
  },
  "devDependencies": {
    "@sveltejs/kit": "catalog:",
    "@sveltejs/package": "catalog:",
    "@sveltepress/vite": "workspace:*",
    "@types/node": "catalog:",
    "svelte": "catalog:",
    "vite": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["svelte"],
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Install dependencies**

```bash
cd /path/to/sveltepress && pnpm install
```

Expected: No errors. `packages/theme-blog` appears in workspace.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/package.json packages/theme-blog/tsconfig.json packages/theme-blog/vitest.config.ts
git commit -m "feat(theme-blog): scaffold package"
```

---

## Task 2: Types

**Files:**
- Create: `packages/theme-blog/src/types.ts`

- [ ] **Step 1: Create types.ts**

```ts
export interface BlogPost {
  slug: string
  title: string
  date: string        // ISO string, e.g. "2026-04-10"
  cover?: string
  tags: string[]
  category?: string
  excerpt: string     // first 120 chars of body text if not in frontmatter
  author?: string
  readingTime: number // minutes, rounded up
  contentHtml: string // pre-rendered HTML of the markdown body
}

export interface ThemeColor {
  primary?: string    // default '#fb923c'
  secondary?: string  // default '#dc2626'
  bg?: string         // default '#1a0a00'
  surface?: string    // default '#2d1200'
}

export interface BlogThemeOptions {
  title: string
  description?: string
  base?: string
  author?: string
  themeColor?: ThemeColor
  postsDir?: string   // default 'src/posts'
  pageSize?: number   // default 12
  rss?: {
    enabled?: boolean
    limit?: number
    copyright?: string
  }
  search?: 'docsearch' | 'meilisearch' | false
  navbar?: Array<{ title: string; to: string }>
}

export interface PostIndex {
  posts: BlogPost[]
  tags: Record<string, BlogPost[]>
  categories: Record<string, BlogPost[]>
}

export const DEFAULT_THEME_COLOR: Required<ThemeColor> = {
  primary: '#fb923c',
  secondary: '#dc2626',
  bg: '#1a0a00',
  surface: '#2d1200',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/theme-blog && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/types.ts
git commit -m "feat(theme-blog): add types"
```

---

## Task 3: Reading time utility

**Files:**
- Create: `packages/theme-blog/src/reading-time.ts`
- Create: `packages/theme-blog/__tests__/reading-time.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// __tests__/reading-time.test.ts
import { describe, expect, it } from 'vitest'
import { readingTime } from '../src/reading-time.js'

describe('readingTime', () => {
  it('returns 1 for very short text', () => {
    expect(readingTime('Hello world')).toBe(1)
  })

  it('returns 1 for exactly 200 words', () => {
    const text = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(1)
  })

  it('returns 2 for 201 words', () => {
    const text = Array.from({ length: 201 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(2)
  })

  it('returns 5 for 900 words', () => {
    const text = Array.from({ length: 900 }, (_, i) => `word${i}`).join(' ')
    expect(readingTime(text)).toBe(5)
  })

  it('ignores markdown syntax tokens', () => {
    const md = '# Heading\n\n**bold** and `code` and [link](http://x.com)'
    expect(readingTime(md)).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/theme-blog && npx vitest run __tests__/reading-time.test.ts
```

Expected: FAIL — `Cannot find module '../src/reading-time.js'`

- [ ] **Step 3: Implement reading-time.ts**

```ts
// src/reading-time.ts

/** Strip markdown tokens (headings, bold, code, links) before counting words. */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1') // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')  // inline code / fenced code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .trim()
}

/**
 * Estimate reading time in minutes.
 * Assumes 200 words per minute; always returns at least 1.
 */
export function readingTime(text: string): number {
  const clean = stripMarkdown(text)
  const words = clean.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd packages/theme-blog && npx vitest run __tests__/reading-time.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/reading-time.ts packages/theme-blog/__tests__/reading-time.test.ts
git commit -m "feat(theme-blog): add reading time utility"
```

---

## Task 4: Post parser (frontmatter + markdown → BlogPost)

**Files:**
- Create: `packages/theme-blog/src/parse-post.ts`
- Create: `packages/theme-blog/__tests__/parse-post.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/parse-post.test.ts
import { describe, expect, it } from 'vitest'
import { parsePost } from '../src/parse-post.js'

const MINIMAL = `---
title: Hello World
date: 2026-04-10
---
This is the **body** of the post.
`

const FULL = `---
title: Full Post
date: 2026-04-08
cover: /img/cover.jpg
tags: [Svelte, Performance]
category: Engineering
excerpt: Custom excerpt text.
author: Alice
draft: false
---
# Section

Some content here for reading time.
`

const DRAFT = `---
title: Draft Post
date: 2026-04-01
draft: true
---
Draft body.
`

describe('parsePost', () => {
  it('parses minimal frontmatter', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.slug).toBe('hello-world')
    expect(result.title).toBe('Hello World')
    expect(result.date).toBe('2026-04-10')
    expect(result.tags).toEqual([])
    expect(result.readingTime).toBe(1)
  })

  it('auto-extracts excerpt from body when not in frontmatter', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.excerpt).toBe('This is the body of the post.')
  })

  it('uses explicit excerpt when provided', async () => {
    const result = await parsePost('full-post', FULL)
    expect(result.excerpt).toBe('Custom excerpt text.')
  })

  it('parses all optional fields', async () => {
    const result = await parsePost('full-post', FULL)
    expect(result.cover).toBe('/img/cover.jpg')
    expect(result.tags).toEqual(['Svelte', 'Performance'])
    expect(result.category).toBe('Engineering')
    expect(result.author).toBe('Alice')
  })

  it('renders contentHtml', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.contentHtml).toContain('<strong>body</strong>')
  })

  it('returns draft flag', async () => {
    const result = await parsePost('draft-post', DRAFT)
    expect(result.draft).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/theme-blog && npx vitest run __tests__/parse-post.test.ts
```

Expected: FAIL — `Cannot find module '../src/parse-post.js'`

- [ ] **Step 3: Implement parse-post.ts**

```ts
// src/parse-post.ts
import type { BlogPost } from './types.js'
import { parse as parseYaml } from 'yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { readingTime } from './reading-time.js'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

/** Split raw markdown into frontmatter YAML block and body text. */
function splitFrontmatter(raw: string): { yaml: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match)
    return { yaml: '', body: raw }
  return { yaml: match[1], body: match[2] }
}

/** Strip HTML tags to get plain text for excerpt generation. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export interface ParsedPost extends BlogPost {
  draft: boolean
}

export async function parsePost(slug: string, raw: string): Promise<ParsedPost> {
  const { yaml, body } = splitFrontmatter(raw)
  const fm = yaml ? (parseYaml(yaml) as Record<string, unknown>) : {}

  const contentHtml = String(await processor.process(body))

  const plainBody = stripHtml(contentHtml)
  const excerpt = typeof fm.excerpt === 'string'
    ? fm.excerpt
    : plainBody.slice(0, 120).trimEnd()

  return {
    slug,
    title: String(fm.title ?? ''),
    date: String(fm.date ?? ''),
    cover: typeof fm.cover === 'string' ? fm.cover : undefined,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    category: typeof fm.category === 'string' ? fm.category : undefined,
    excerpt,
    author: typeof fm.author === 'string' ? fm.author : undefined,
    readingTime: readingTime(body),
    contentHtml,
    draft: fm.draft === true,
  }
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/theme-blog && npx vitest run __tests__/parse-post.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/parse-post.ts packages/theme-blog/__tests__/parse-post.test.ts
git commit -m "feat(theme-blog): add post parser"
```

---

## Task 5: Post index builder + virtual module content

**Files:**
- Create: `packages/theme-blog/src/build-index.ts`
- Create: `packages/theme-blog/__tests__/build-index.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/build-index.test.ts
import { describe, expect, it } from 'vitest'
import { buildIndex } from '../src/build-index.js'
import type { ParsedPost } from '../src/parse-post.js'

function makePost(overrides: Partial<ParsedPost> = {}): ParsedPost {
  return {
    slug: 'test',
    title: 'Test',
    date: '2026-04-10',
    tags: [],
    excerpt: 'excerpt',
    readingTime: 1,
    contentHtml: '<p>content</p>',
    draft: false,
    ...overrides,
  }
}

describe('buildIndex', () => {
  it('excludes draft posts', () => {
    const posts = [makePost({ draft: true }), makePost({ slug: 'pub', draft: false })]
    const index = buildIndex(posts)
    expect(index.posts).toHaveLength(1)
    expect(index.posts[0].slug).toBe('pub')
  })

  it('sorts posts by date descending', () => {
    const posts = [
      makePost({ slug: 'older', date: '2026-03-01' }),
      makePost({ slug: 'newer', date: '2026-04-10' }),
    ]
    const index = buildIndex(posts)
    expect(index.posts[0].slug).toBe('newer')
    expect(index.posts[1].slug).toBe('older')
  })

  it('builds tag index', () => {
    const posts = [
      makePost({ slug: 'a', tags: ['Svelte', 'Tools'] }),
      makePost({ slug: 'b', tags: ['Svelte'] }),
    ]
    const index = buildIndex(posts)
    expect(index.tags['Svelte']).toHaveLength(2)
    expect(index.tags['Tools']).toHaveLength(1)
  })

  it('builds category index', () => {
    const posts = [
      makePost({ slug: 'a', category: 'Engineering' }),
      makePost({ slug: 'b', category: 'Engineering' }),
      makePost({ slug: 'c', category: 'Design' }),
    ]
    const index = buildIndex(posts)
    expect(index.categories['Engineering']).toHaveLength(2)
    expect(index.categories['Design']).toHaveLength(1)
  })

  it('generates correct virtual module code', () => {
    const { toVirtualModuleCode } = require('../src/build-index.js')
    // covered in vite-plugin tests
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/theme-blog && npx vitest run __tests__/build-index.test.ts
```

Expected: FAIL — `Cannot find module '../src/build-index.js'`

- [ ] **Step 3: Implement build-index.ts**

```ts
// src/build-index.ts
import type { ParsedPost } from './parse-post.js'
import type { PostIndex } from './types.js'

export function buildIndex(parsedPosts: ParsedPost[]): PostIndex {
  const posts = parsedPosts
    .filter(p => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))

  const tags: Record<string, typeof posts> = {}
  const categories: Record<string, typeof posts> = {}

  for (const post of posts) {
    for (const tag of post.tags) {
      tags[tag] ??= []
      tags[tag].push(post)
    }
    if (post.category) {
      categories[post.category] ??= []
      categories[post.category].push(post)
    }
  }

  return { posts, tags, categories }
}

/** Generate the JS string for a virtual module. */
export function toVirtualModuleCode(index: PostIndex): {
  postsModule: string
  tagsModule: string
  categoriesModule: string
} {
  const postsModule = `export const posts = ${JSON.stringify(index.posts)}`
  const tagsModule = `export const tags = ${JSON.stringify(index.tags)}`
  const categoriesModule = `export const categories = ${JSON.stringify(index.categories)}`
  return { postsModule, tagsModule, categoriesModule }
}
```

- [ ] **Step 4: Fix the test — remove the broken require() call and add a proper test for toVirtualModuleCode**

Replace the last test in `__tests__/build-index.test.ts` with:

```ts
  it('generates valid JS for virtual modules', () => {
    const posts = [makePost({ slug: 'a', tags: ['Svelte'] })]
    const index = buildIndex(posts)
    const { postsModule, tagsModule, categoriesModule } = toVirtualModuleCode(index)
    expect(postsModule).toContain('"slug":"a"')
    expect(tagsModule).toContain('"Svelte"')
    expect(categoriesModule).toBe('export const categories = {}')
  })
```

Also add the import to the top of the test file:

```ts
import { buildIndex, toVirtualModuleCode } from '../src/build-index.js'
```

- [ ] **Step 5: Run tests**

```bash
cd packages/theme-blog && npx vitest run __tests__/build-index.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/theme-blog/src/build-index.ts packages/theme-blog/__tests__/build-index.test.ts
git commit -m "feat(theme-blog): add post index builder"
```

---

## Task 6: RSS generator

**Files:**
- Create: `packages/theme-blog/src/rss.ts`
- Create: `packages/theme-blog/__tests__/rss.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/rss.test.ts
import { describe, expect, it } from 'vitest'
import { generateRss } from '../src/rss.js'
import type { BlogPost } from '../src/types.js'

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'test-post',
    title: 'Test Post',
    date: '2026-04-10',
    tags: [],
    excerpt: 'Test excerpt.',
    readingTime: 1,
    contentHtml: '<p>content</p>',
    ...overrides,
  }
}

describe('generateRss', () => {
  it('outputs valid RSS 2.0 wrapper', () => {
    const xml = generateRss([], { title: 'My Blog', base: 'https://example.com' })
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('<title>My Blog</title>')
    expect(xml).toContain('<link>https://example.com</link>')
    expect(xml).toContain('</channel>')
    expect(xml).toContain('</rss>')
  })

  it('includes an <item> per post', () => {
    const posts = [makePost(), makePost({ slug: 'second', title: 'Second' })]
    const xml = generateRss(posts, { title: 'Blog', base: 'https://example.com' })
    expect(xml.match(/<item>/g)).toHaveLength(2)
  })

  it('item contains title, link, pubDate, description', () => {
    const xml = generateRss(
      [makePost({ slug: 'hello', title: 'Hello', excerpt: 'An excerpt.' })],
      { title: 'Blog', base: 'https://example.com' },
    )
    expect(xml).toContain('<title>Hello</title>')
    expect(xml).toContain('<link>https://example.com/posts/hello</link>')
    expect(xml).toContain('<description>An excerpt.</description>')
  })

  it('respects limit option', () => {
    const posts = Array.from({ length: 25 }, (_, i) =>
      makePost({ slug: `post-${i}`, date: `2026-01-${String(i + 1).padStart(2, '0')}` }),
    )
    const xml = generateRss(posts, { title: 'Blog', base: 'https://example.com', limit: 10 })
    expect(xml.match(/<item>/g)).toHaveLength(10)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/theme-blog && npx vitest run __tests__/rss.test.ts
```

Expected: FAIL — `Cannot find module '../src/rss.js'`

- [ ] **Step 3: Implement rss.ts**

```ts
// src/rss.ts
import type { BlogPost } from './types.js'

interface RssOptions {
  title: string
  base: string
  description?: string
  copyright?: string
  limit?: number
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateRss(posts: BlogPost[], opts: RssOptions): string {
  const limit = opts.limit ?? 20
  const limited = posts.slice(0, limit)
  const base = opts.base.replace(/\/$/, '')

  const items = limited.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/posts/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(opts.description ?? '')}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${opts.copyright ? `<copyright>${escapeXml(opts.copyright)}</copyright>` : ''}
    ${items}
  </channel>
</rss>`
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/theme-blog && npx vitest run __tests__/rss.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/rss.ts packages/theme-blog/__tests__/rss.test.ts
git commit -m "feat(theme-blog): add RSS generator"
```

---

## Task 7: Route templates + scaffold utility

**Files:**
- Create: `packages/theme-blog/src/route-templates.ts`
- Create: `packages/theme-blog/src/scaffold.ts`

No tests for scaffold (it does file I/O and is tested implicitly via integration).

- [ ] **Step 1: Create route-templates.ts**

These are the SvelteKit route files the plugin writes into the user's project on first run.

```ts
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
  const post = posts.find(p => p.slug === params.slug)
  if (!post) error(404, 'Post not found')
  return { post }
}
`

export const POST_PAGE = `<script lang="ts">
  import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte'
  export let data
  const { post } = data
</script>
<PostLayout {post} />
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
```

- [ ] **Step 2: Create scaffold.ts**

```ts
// src/scaffold.ts
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  CAT_PAGE,
  CAT_PAGE_LOAD,
  LIST_PAGE,
  POST_PAGE,
  POST_PAGE_LOAD,
  ROOT_LAYOUT,
  TAG_PAGE,
  TAG_PAGE_LOAD,
} from './route-templates.js'

interface ScaffoldFile {
  path: string
  content: string
}

function scaffoldFiles(root: string): ScaffoldFile[] {
  const r = (p: string) => join(root, 'src', 'routes', p)
  return [
    { path: r('+layout.svelte'), content: ROOT_LAYOUT },
    { path: r('+page.svelte'), content: LIST_PAGE },
    { path: r('posts/[slug]/+page.ts'), content: POST_PAGE_LOAD },
    { path: r('posts/[slug]/+page.svelte'), content: POST_PAGE },
    { path: r('tags/[tag]/+page.ts'), content: TAG_PAGE_LOAD },
    { path: r('tags/[tag]/+page.svelte'), content: TAG_PAGE },
    { path: r('categories/[cat]/+page.ts'), content: CAT_PAGE_LOAD },
    { path: r('categories/[cat]/+page.svelte'), content: CAT_PAGE },
  ]
}

/** Write route files that don't already exist. Logs each written file. */
export async function scaffoldRoutes(root: string): Promise<void> {
  for (const file of scaffoldFiles(root)) {
    if (existsSync(file.path))
      continue
    await mkdir(join(file.path, '..'), { recursive: true })
    await writeFile(file.path, file.content, 'utf-8')
    console.log(`[theme-blog] scaffolded ${file.path.replace(root, '')}`)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/route-templates.ts packages/theme-blog/src/scaffold.ts
git commit -m "feat(theme-blog): add route scaffold utility"
```

---

## Task 8: Vite plugin

**Files:**
- Create: `packages/theme-blog/src/vite-plugin.ts`

- [ ] **Step 1: Create vite-plugin.ts**

```ts
// src/vite-plugin.ts
import type { BlogThemeOptions } from './types.js'
import type { Plugin, ResolvedConfig } from 'vite'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { buildIndex, toVirtualModuleCode } from './build-index.js'
import { parsePost } from './parse-post.js'
import { generateRss } from './rss.js'
import { scaffoldRoutes } from './scaffold.js'

const VIRTUAL_POSTS = 'virtual:sveltepress/blog-posts'
const VIRTUAL_TAGS = 'virtual:sveltepress/blog-tags'
const VIRTUAL_CATEGORIES = 'virtual:sveltepress/blog-categories'

const RESOLVED = {
  POSTS: `\0${VIRTUAL_POSTS}`,
  TAGS: `\0${VIRTUAL_TAGS}`,
  CATEGORIES: `\0${VIRTUAL_CATEGORIES}`,
}

export function blogVitePlugin(options: BlogThemeOptions): Plugin {
  let config: ResolvedConfig
  let postsModule = 'export const posts = []'
  let tagsModule = 'export const tags = {}'
  let categoriesModule = 'export const categories = {}'

  async function rebuildIndex(root: string) {
    const postsDir = resolve(root, options.postsDir ?? 'src/posts')
    let files: string[] = []
    try {
      files = (await readdir(postsDir)).filter(f => f.endsWith('.md'))
    }
    catch {
      // postsDir doesn't exist yet — that's OK
    }

    const parsed = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(join(postsDir, file), 'utf-8')
        const slug = file.replace(/\.md$/, '')
        return parsePost(slug, raw)
      }),
    )

    const index = buildIndex(parsed)
    const modules = toVirtualModuleCode(index)
    postsModule = modules.postsModule
    tagsModule = modules.tagsModule
    categoriesModule = modules.categoriesModule
    return index
  }

  return {
    name: '@sveltepress/theme-blog',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      await scaffoldRoutes(config.root)
      const index = await rebuildIndex(config.root)

      if (options.rss?.enabled !== false) {
        const xml = generateRss(index.posts, {
          title: options.title,
          base: options.base ?? 'http://localhost',
          description: options.description,
          copyright: options.rss?.copyright,
          limit: options.rss?.limit ?? 20,
        })
        const staticDir = resolve(config.root, 'static')
        try {
          await writeFile(join(staticDir, 'rss.xml'), xml, 'utf-8')
        }
        catch {
          // static/ may not exist in all project setups
        }
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_POSTS) return RESOLVED.POSTS
      if (id === VIRTUAL_TAGS) return RESOLVED.TAGS
      if (id === VIRTUAL_CATEGORIES) return RESOLVED.CATEGORIES
    },

    load(id) {
      if (id === RESOLVED.POSTS) return postsModule
      if (id === RESOLVED.TAGS) return tagsModule
      if (id === RESOLVED.CATEGORIES) return categoriesModule
    },

    configureServer(server) {
      const postsDir = resolve(config.root, options.postsDir ?? 'src/posts')
      server.watcher.add(postsDir)
      server.watcher.on('change', async (file) => {
        if (!file.startsWith(postsDir)) return
        await rebuildIndex(config.root)
        const mods = [RESOLVED.POSTS, RESOLVED.TAGS, RESOLVED.CATEGORIES]
          .map(id => server.moduleGraph.getModuleById(id))
          .filter(Boolean)
        mods.forEach(mod => server.moduleGraph.invalidateModule(mod!))
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/theme-blog && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/vite-plugin.ts
git commit -m "feat(theme-blog): add vite plugin (virtual modules + HMR + scaffold)"
```

---

## Task 9: Theme entry point

**Files:**
- Create: `packages/theme-blog/src/index.ts`

- [ ] **Step 1: Create index.ts**

```ts
// src/index.ts
import type { BlogThemeOptions, DEFAULT_THEME_COLOR } from './types.js'
import type { ResolvedTheme } from '@sveltepress/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { blogVitePlugin } from './vite-plugin.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export type { BlogThemeOptions, BlogPost } from './types.js'

export function blogTheme(options: BlogThemeOptions): ResolvedTheme {
  return {
    name: '@sveltepress/theme-blog',
    globalLayout: resolve(__dirname, 'components/GlobalLayout.svelte'),
    pageLayout: resolve(__dirname, 'components/PageLayout.svelte'),
    vitePlugins: corePlugin => [blogVitePlugin(options), corePlugin],
    // Blog posts don't use the Sveltepress markdown highlighter by default
    // (content is pre-rendered in the virtual module). Provide a passthrough.
    highlighter: async (code, _lang) => code,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/theme-blog && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/index.ts
git commit -m "feat(theme-blog): add theme entry point"
```

---

## Task 10: GlobalLayout + Navbar (base styles & Ember palette)

**Files:**
- Create: `packages/theme-blog/src/components/GlobalLayout.svelte`
- Create: `packages/theme-blog/src/components/Navbar.svelte`

- [ ] **Step 1: Create GlobalLayout.svelte**

```svelte
<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { BlogThemeOptions } from '../types.js'
  import Navbar from './Navbar.svelte'

  export let themeOptions: BlogThemeOptions | undefined = undefined

  const primary = themeOptions?.themeColor?.primary ?? '#fb923c'
  const secondary = themeOptions?.themeColor?.secondary ?? '#dc2626'
  const bg = themeOptions?.themeColor?.bg ?? '#1a0a00'
  const surface = themeOptions?.themeColor?.surface ?? '#2d1200'

  // Build CSS variable string — injected via svelte:head {@html} since Svelte
  // does not support interpolation inside <style> blocks.
  const cssVars = `:root{--sp-blog-primary:${primary};--sp-blog-secondary:${secondary};--sp-blog-bg:${bg};--sp-blog-surface:${surface};--sp-blog-text:#fff7ed;--sp-blog-muted:#a16207;--sp-blog-border:#3f1c04;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:var(--sp-blog-bg);color:var(--sp-blog-text);font-family:Inter,system-ui,sans-serif;line-height:1.6;}code,pre{font-family:'JetBrains Mono','Fira Code',monospace;}a{color:var(--sp-blog-primary);text-decoration:none;}a:hover{text-decoration:underline;}`
</script>

<svelte:head>
  {@html `<style>${cssVars}</style>`}
</svelte:head>

<Navbar
  title={themeOptions?.title ?? 'Blog'}
  links={themeOptions?.navbar ?? []}
/>

<main class="sp-blog-main">
  <slot />
</main>

<style>
  .sp-blog-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>
```

- [ ] **Step 2: Create Navbar.svelte**

```svelte
<!-- src/components/Navbar.svelte -->
<script lang="ts">
  export let title: string
  export let links: Array<{ title: string; to: string }> = []
</script>

<nav class="sp-blog-nav">
  <a href="/" class="sp-blog-nav__logo">{title}</a>
  <div class="sp-blog-nav__links">
    {#each links as link}
      <a href={link.to}>{link.title}</a>
    {/each}
    <slot name="search" />
  </div>
</nav>

<style>
  .sp-blog-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--sp-blog-surface);
    border-bottom: 1px solid var(--sp-blog-border);
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    height: 56px;
    gap: 1rem;
  }
  .sp-blog-nav__logo {
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--sp-blog-primary);
    letter-spacing: -0.02em;
    text-decoration: none;
  }
  .sp-blog-nav__links {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-left: auto;
    font-size: 0.875rem;
  }
  .sp-blog-nav__links a {
    color: #d6d3d1;
    text-decoration: none;
    transition: color 0.15s;
  }
  .sp-blog-nav__links a:hover { color: var(--sp-blog-primary); }
</style>
```

- [ ] **Step 3: Create PageLayout.svelte**

```svelte
<!-- src/components/PageLayout.svelte -->
<script lang="ts">
  // Intentionally minimal — content is slotted in from +page.svelte
</script>

<div class="sp-blog-page">
  <slot />
</div>

<style>
  .sp-blog-page {
    padding-top: 1rem;
  }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add packages/theme-blog/src/components/GlobalLayout.svelte \
        packages/theme-blog/src/components/Navbar.svelte \
        packages/theme-blog/src/components/PageLayout.svelte
git commit -m "feat(theme-blog): add GlobalLayout, Navbar, PageLayout"
```

---

## Task 11: Post card components + MasonryGrid

**Files:**
- Create: `packages/theme-blog/src/components/MasonryGrid.svelte`
- Create: `packages/theme-blog/src/components/PostCardLarge.svelte`
- Create: `packages/theme-blog/src/components/PostCardSmall.svelte`
- Create: `packages/theme-blog/src/components/PostCardFeatured.svelte`

- [ ] **Step 1: Create PostCardLarge.svelte** (has cover image, taller)

```svelte
<!-- src/components/PostCardLarge.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let post: BlogPost

  // Hash tag name to one of the Ember gradients for cover fallback
  const GRADIENTS = [
    'linear-gradient(135deg,#ea580c,#dc2626)',
    'linear-gradient(135deg,#f59e0b,#ea580c)',
    'linear-gradient(135deg,#c2410c,#9a3412)',
    'linear-gradient(135deg,#b45309,#d97706)',
    'linear-gradient(135deg,#dc2626,#7c2d12)',
  ]
  function tagGradient(tag: string): string {
    let hash = 0
    for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return GRADIENTS[hash % GRADIENTS.length]
  }
  const gradient = post.tags[0] ? tagGradient(post.tags[0]) : GRADIENTS[0]
</script>

<article class="sp-card-large">
  <a href={`/posts/${post.slug}`} class="sp-card-large__link">
    {#if post.cover}
      <img src={post.cover} alt={post.title} class="sp-card-large__cover" />
    {:else}
      <div class="sp-card-large__cover sp-card-large__cover--gradient" style="background:{gradient}"></div>
    {/if}
    <div class="sp-card-large__body">
      {#if post.tags[0]}
        <span class="sp-card__tag">{post.tags[0]}</span>
      {/if}
      <h2 class="sp-card-large__title">{post.title}</h2>
      <p class="sp-card-large__excerpt">{post.excerpt}</p>
      <div class="sp-card__meta">
        <time>{post.date}</time>
        <span>{post.readingTime} min read</span>
      </div>
    </div>
  </a>
</article>

<style>
  .sp-card-large { background: var(--sp-blog-surface); border-radius: 10px; overflow: hidden; break-inside: avoid; margin-bottom: 1rem; transition: transform 0.2s; }
  .sp-card-large:hover { transform: translateY(-3px); }
  .sp-card-large__link { display: block; text-decoration: none; color: inherit; }
  .sp-card-large__cover { width: 100%; height: 180px; object-fit: cover; display: block; }
  .sp-card-large__cover--gradient { }
  .sp-card-large__body { padding: 1rem; }
  .sp-card-large__title { font-size: 1.05rem; font-weight: 800; color: #fff7ed; margin: 0.35rem 0 0.5rem; line-height: 1.3; }
  .sp-card-large__excerpt { font-size: 0.825rem; color: var(--sp-blog-muted); line-height: 1.55; }
  .sp-card__tag { font-size: 0.7rem; font-weight: 700; color: var(--sp-blog-primary); text-transform: uppercase; letter-spacing: 0.05em; }
  .sp-card__meta { display: flex; gap: 0.75rem; font-size: 0.75rem; color: #78350f; margin-top: 0.75rem; }
</style>
```

- [ ] **Step 2: Create PostCardSmall.svelte** (text-only + left accent bar)

```svelte
<!-- src/components/PostCardSmall.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let post: BlogPost
</script>

<article class="sp-card-small">
  <a href={`/posts/${post.slug}`} class="sp-card-small__link">
    {#if post.tags[0]}
      <span class="sp-card__tag">{post.tags[0]}</span>
    {/if}
    <h2 class="sp-card-small__title">{post.title}</h2>
    <p class="sp-card-small__quote">{post.excerpt}</p>
    <div class="sp-card__meta">
      <time>{post.date}</time>
      <span>{post.readingTime} min read</span>
    </div>
  </a>
</article>

<style>
  .sp-card-small { background: var(--sp-blog-surface); border-radius: 10px; overflow: hidden; break-inside: avoid; margin-bottom: 1rem; border-left: 4px solid var(--sp-blog-primary); transition: transform 0.2s; }
  .sp-card-small:hover { transform: translateY(-3px); }
  .sp-card-small__link { display: block; text-decoration: none; color: inherit; padding: 1rem 1rem 1rem 0.875rem; }
  .sp-card-small__title { font-size: 0.95rem; font-weight: 800; color: #fff7ed; margin: 0.3rem 0 0.45rem; line-height: 1.35; }
  .sp-card-small__quote { font-size: 0.8rem; color: var(--sp-blog-muted); line-height: 1.5; }
  .sp-card__tag { font-size: 0.7rem; font-weight: 700; color: var(--sp-blog-primary); text-transform: uppercase; letter-spacing: 0.05em; }
  .sp-card__meta { display: flex; gap: 0.75rem; font-size: 0.75rem; color: #78350f; margin-top: 0.75rem; }
</style>
```

- [ ] **Step 3: Create PostCardFeatured.svelte** (pinned, full-width banner)

```svelte
<!-- src/components/PostCardFeatured.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let post: BlogPost
</script>

<article class="sp-card-featured">
  <a href={`/posts/${post.slug}`} class="sp-card-featured__link">
    <div
      class="sp-card-featured__bg"
      style={post.cover ? `background-image:url(${post.cover})` : 'background:linear-gradient(135deg,#ea580c 0%,#dc2626 50%,#9a3412 100%)'}
    >
      <div class="sp-card-featured__overlay">
        {#if post.tags[0]}
          <span class="sp-card-featured__tag">{post.tags[0]}</span>
        {/if}
        <h2 class="sp-card-featured__title">{post.title}</h2>
        <p class="sp-card-featured__excerpt">{post.excerpt}</p>
        <div class="sp-card__meta sp-card__meta--light">
          <time>{post.date}</time>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </div>
  </a>
</article>

<style>
  .sp-card-featured { border-radius: 12px; overflow: hidden; break-inside: avoid; margin-bottom: 1rem; transition: transform 0.2s; }
  .sp-card-featured:hover { transform: translateY(-3px); }
  .sp-card-featured__link { display: block; text-decoration: none; color: inherit; }
  .sp-card-featured__bg { background-size: cover; background-position: center; min-height: 220px; position: relative; }
  .sp-card-featured__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,10,0,.92) 40%, transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.25rem; }
  .sp-card-featured__tag { font-size: 0.7rem; font-weight: 700; color: #fdba74; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(234,88,12,.35); padding: 2px 8px; border-radius: 3px; display: inline-block; margin-bottom: 0.5rem; width: fit-content; }
  .sp-card-featured__title { font-size: 1.3rem; font-weight: 900; color: #fff7ed; line-height: 1.25; margin-bottom: 0.5rem; }
  .sp-card-featured__excerpt { font-size: 0.85rem; color: #d6d3d1; line-height: 1.5; }
  .sp-card__meta { display: flex; gap: 0.75rem; font-size: 0.75rem; color: #78350f; margin-top: 0.75rem; }
  .sp-card__meta--light { color: #a8a29e; }
</style>
```

- [ ] **Step 4: Create MasonryGrid.svelte**

```svelte
<!-- src/components/MasonryGrid.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import PostCardFeatured from './PostCardFeatured.svelte'
  import PostCardLarge from './PostCardLarge.svelte'
  import PostCardSmall from './PostCardSmall.svelte'

  export let posts: BlogPost[]

  // First post (if pinned or just the latest) becomes the featured card
  $: [featured, ...rest] = posts
  // Posts with a cover → Large; without → Small
  $: gridPosts = rest
</script>

<div class="sp-masonry-wrap">
  {#if featured}
    <PostCardFeatured post={featured} />
  {/if}

  <div class="sp-masonry">
    {#each gridPosts as post (post.slug)}
      {#if post.cover}
        <PostCardLarge {post} />
      {:else}
        <PostCardSmall {post} />
      {/if}
    {/each}
  </div>
</div>

<style>
  .sp-masonry-wrap { }
  .sp-masonry {
    columns: 1;
    column-gap: 1rem;
  }
  @media (min-width: 640px) { .sp-masonry { columns: 2; } }
  @media (min-width: 1024px) { .sp-masonry { columns: 3; } }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/components/MasonryGrid.svelte \
        packages/theme-blog/src/components/PostCardLarge.svelte \
        packages/theme-blog/src/components/PostCardSmall.svelte \
        packages/theme-blog/src/components/PostCardFeatured.svelte
git commit -m "feat(theme-blog): add masonry grid and post card components"
```

---

## Task 12: Post detail components + PostLayout

**Files:**
- Create: `packages/theme-blog/src/components/PostHero.svelte`
- Create: `packages/theme-blog/src/components/PostMeta.svelte`
- Create: `packages/theme-blog/src/components/TableOfContents.svelte`
- Create: `packages/theme-blog/src/components/PostNav.svelte`
- Create: `packages/theme-blog/src/components/PostLayout.svelte`

- [ ] **Step 1: Create PostHero.svelte**

```svelte
<!-- src/components/PostHero.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let post: BlogPost
</script>

<header class="sp-post-hero" style={post.cover ? `--hero-bg: url(${post.cover})` : ''}>
  <div class="sp-post-hero__overlay">
    {#if post.category}
      <span class="sp-post-hero__cat">{post.category}</span>
    {/if}
    <h1 class="sp-post-hero__title">{post.title}</h1>
  </div>
</header>

<style>
  .sp-post-hero {
    position: relative;
    min-height: 280px;
    display: flex;
    align-items: flex-end;
    background-image: var(--hero-bg, linear-gradient(135deg,#ea580c,#9a3412));
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .sp-post-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26,10,0,.88) 40%, rgba(26,10,0,.2));
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 2rem;
  }
  .sp-post-hero__cat {
    font-size: 0.72rem;
    font-weight: 700;
    color: #fdba74;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.6rem;
  }
  .sp-post-hero__title {
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 900;
    color: #fff7ed;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
</style>
```

- [ ] **Step 2: Create PostMeta.svelte**

```svelte
<!-- src/components/PostMeta.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let post: BlogPost
</script>

<div class="sp-post-meta">
  {#if post.author}
    <span class="sp-post-meta__author">{post.author}</span>
    <span class="sp-post-meta__sep">·</span>
  {/if}
  <time class="sp-post-meta__date">{post.date}</time>
  <span class="sp-post-meta__sep">·</span>
  <span>{post.readingTime} min read</span>
  {#if post.tags.length}
    <span class="sp-post-meta__sep">·</span>
    <div class="sp-post-meta__tags">
      {#each post.tags as tag}
        <a href={`/tags/${tag}`} class="sp-post-meta__tag">{tag}</a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .sp-post-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--sp-blog-muted); margin-bottom: 2rem; }
  .sp-post-meta__sep { color: var(--sp-blog-border); }
  .sp-post-meta__author { font-weight: 600; color: #d6d3d1; }
  .sp-post-meta__date { }
  .sp-post-meta__tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .sp-post-meta__tag { background: var(--sp-blog-surface); border: 1px solid var(--sp-blog-border); color: var(--sp-blog-primary); padding: 1px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; text-decoration: none; }
  .sp-post-meta__tag:hover { background: var(--sp-blog-border); }
</style>
```

- [ ] **Step 3: Create TableOfContents.svelte**

```svelte
<!-- src/components/TableOfContents.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'

  let headings: Array<{ id: string; text: string; level: number }> = []
  let activeId = ''

  onMount(() => {
    const els = document.querySelectorAll<HTMLElement>('.sp-post-content h2, .sp-post-content h3')
    headings = Array.from(els).map(el => ({
      id: el.id,
      text: el.textContent ?? '',
      level: Number(el.tagName[1]),
    }))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId = entry.target.id
        }
      },
      { rootMargin: '0px 0px -60% 0px' },
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  })
</script>

{#if headings.length}
  <nav class="sp-toc">
    <p class="sp-toc__label">目录</p>
    <ul>
      {#each headings as h}
        <li class="sp-toc__item" class:sp-toc__item--h3={h.level === 3}>
          <a
            href={`#${h.id}`}
            class="sp-toc__link"
            class:sp-toc__link--active={activeId === h.id}
          >{h.text}</a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .sp-toc { position: sticky; top: 80px; font-size: 0.8rem; border-left: 2px solid var(--sp-blog-border); padding-left: 1rem; }
  .sp-toc__label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--sp-blog-muted); margin-bottom: 0.6rem; }
  .sp-toc ul { list-style: none; padding: 0; }
  .sp-toc__item { margin-bottom: 0.35rem; }
  .sp-toc__item--h3 { padding-left: 0.75rem; }
  .sp-toc__link { color: var(--sp-blog-muted); text-decoration: none; transition: color 0.15s; }
  .sp-toc__link:hover, .sp-toc__link--active { color: var(--sp-blog-primary); }
</style>
```

- [ ] **Step 4: Create PostNav.svelte**

```svelte
<!-- src/components/PostNav.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  export let prev: BlogPost | undefined = undefined
  export let next: BlogPost | undefined = undefined
</script>

<nav class="sp-post-nav">
  {#if prev}
    <a href={`/posts/${prev.slug}`} class="sp-post-nav__item sp-post-nav__item--prev">
      <span class="sp-post-nav__dir">← 上一篇</span>
      <span class="sp-post-nav__title">{prev.title}</span>
    </a>
  {:else}
    <div></div>
  {/if}
  {#if next}
    <a href={`/posts/${next.slug}`} class="sp-post-nav__item sp-post-nav__item--next">
      <span class="sp-post-nav__dir">下一篇 →</span>
      <span class="sp-post-nav__title">{next.title}</span>
    </a>
  {/if}
</nav>

<style>
  .sp-post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--sp-blog-border); }
  .sp-post-nav__item { display: flex; flex-direction: column; gap: 0.25rem; max-width: 45%; text-decoration: none; }
  .sp-post-nav__item--next { align-items: flex-end; }
  .sp-post-nav__dir { font-size: 0.75rem; color: var(--sp-blog-muted); }
  .sp-post-nav__title { font-size: 0.875rem; font-weight: 600; color: var(--sp-blog-primary); line-height: 1.4; }
  .sp-post-nav__title:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 5: Create PostLayout.svelte**

```svelte
<!-- src/components/PostLayout.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { posts } from 'virtual:sveltepress/blog-posts'
  import PostHero from './PostHero.svelte'
  import PostMeta from './PostMeta.svelte'
  import TableOfContents from './TableOfContents.svelte'
  import PostNav from './PostNav.svelte'

  export let post: BlogPost

  $: idx = posts.findIndex(p => p.slug === post.slug)
  $: prev = posts[idx + 1] as BlogPost | undefined
  $: next = posts[idx - 1] as BlogPost | undefined
</script>

<article class="sp-post">
  <PostHero {post} />
  <div class="sp-post__body">
    <div class="sp-post__content-wrap">
      <PostMeta {post} />
      <div class="sp-post-content">
        {@html post.contentHtml}
      </div>
      <PostNav {prev} {next} />
    </div>
    <aside class="sp-post__toc">
      <TableOfContents />
    </aside>
  </div>
</article>

<style>
  .sp-post__body { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 1024px) { .sp-post__body { grid-template-columns: 1fr 220px; } }
  .sp-post__content-wrap { min-width: 0; }
  .sp-post-content { line-height: 1.75; color: #d6d3d1; }
  .sp-post-content :global(h2),
  .sp-post-content :global(h3) { color: #fff7ed; font-weight: 700; margin: 2rem 0 0.75rem; }
  .sp-post-content :global(h2) { font-size: 1.35rem; }
  .sp-post-content :global(h3) { font-size: 1.1rem; }
  .sp-post-content :global(p) { margin-bottom: 1.15rem; }
  .sp-post-content :global(code) { background: var(--sp-blog-surface); color: var(--sp-blog-primary); padding: 1px 5px; border-radius: 3px; font-size: 0.875em; }
  .sp-post-content :global(pre) { background: var(--sp-blog-surface); border: 1px solid var(--sp-blog-border); border-radius: 8px; padding: 1rem; overflow-x: auto; margin-bottom: 1.25rem; }
  .sp-post-content :global(pre code) { background: none; padding: 0; color: inherit; }
  .sp-post-content :global(blockquote) { border-left: 3px solid var(--sp-blog-primary); padding-left: 1rem; color: var(--sp-blog-muted); margin: 1.25rem 0; }
  .sp-post-content :global(a) { color: var(--sp-blog-primary); }
  .sp-post__toc { display: none; }
  @media (min-width: 1024px) { .sp-post__toc { display: block; } }
</style>
```

- [ ] **Step 6: Commit**

```bash
git add packages/theme-blog/src/components/PostHero.svelte \
        packages/theme-blog/src/components/PostMeta.svelte \
        packages/theme-blog/src/components/TableOfContents.svelte \
        packages/theme-blog/src/components/PostNav.svelte \
        packages/theme-blog/src/components/PostLayout.svelte
git commit -m "feat(theme-blog): add post detail components and PostLayout"
```

---

## Task 13: Taxonomy component + run all tests

**Files:**
- Create: `packages/theme-blog/src/components/TaxonomyHeader.svelte`

- [ ] **Step 1: Create TaxonomyHeader.svelte**

```svelte
<!-- src/components/TaxonomyHeader.svelte -->
<script lang="ts">
  export let name: string
  export let count: number
  export let type: 'tag' | 'category'
</script>

<header class="sp-taxonomy">
  <p class="sp-taxonomy__type">{type === 'tag' ? '标签' : '分类'}</p>
  <h1 class="sp-taxonomy__name">{name}</h1>
  <p class="sp-taxonomy__count">{count} 篇文章</p>
</header>

<style>
  .sp-taxonomy { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--sp-blog-border); }
  .sp-taxonomy__type { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--sp-blog-muted); margin-bottom: 0.4rem; }
  .sp-taxonomy__name { font-size: 2rem; font-weight: 900; color: var(--sp-blog-primary); letter-spacing: -0.02em; }
  .sp-taxonomy__count { font-size: 0.875rem; color: var(--sp-blog-muted); margin-top: 0.4rem; }
</style>
```

- [ ] **Step 2: Run all tests**

```bash
cd /path/to/sveltepress && pnpm test
```

Expected: All tests pass (including the new theme-blog tests).

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Fix any lint issues before committing.

- [ ] **Step 4: Create changeset**

```bash
pnpm changeset
```

Select `@sveltepress/theme-blog`, type `minor`, description:
`feat: add @sveltepress/theme-blog — magazine-style blog theme with Ember palette, masonry grid, virtual modules, and RSS`

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/components/TaxonomyHeader.svelte .changeset/
git commit -m "feat(theme-blog): add TaxonomyHeader; complete initial implementation"
```

---

## Done ✓

After Task 13, the package is complete and ready for integration testing. A user can install it and point their `vite.config.ts` at `blogTheme()` to get a working blog with Ember palette, masonry post grid, tag/category pages, and auto-generated RSS.
