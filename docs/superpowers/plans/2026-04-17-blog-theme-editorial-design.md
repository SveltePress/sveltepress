# Blog Theme Editorial Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `@sveltepress/theme-blog` a magazine-grade editorial personality — Fraunces + Inter typography, drop cap, § section glyph, side-hanging pull quote, numbered figure captions, vertical side-rail — without changing layout or breaking the card↔post view-transition morph.

**Architecture:** Additive only. One typography foundation change in `GlobalLayout.svelte`; CSS-only restyles to seven existing components; one new leaf component (`SideRail.svelte`); two new markdown plugins (`remark-pull-quote`, `rehype-figure`) registered in the existing `parse-post.ts` unified pipeline. No structural markup edits, no changes to VT names, no new layout grids.

**Tech Stack:** Svelte 5 runes, SvelteKit 2, Vitest, `unified` + `remark-*` + `rehype-*`, `@fontsource-variable/fraunces`, existing `@fontsource/inter`.

**Spec:** `docs/superpowers/specs/2026-04-17-blog-theme-editorial-design.md`

---

## File Structure

**Modify:**
- `pnpm-workspace.yaml` — catalog entry for `@fontsource-variable/fraunces`
- `packages/theme-blog/package.json` — add `@fontsource-variable/fraunces`, `remark-directive` deps
- `packages/theme-blog/src/components/GlobalLayout.svelte` — font imports, `--sp-font-*` tokens, Fraunces body + heading + drop-cap + hr + pull-quote + figure global rules
- `packages/theme-blog/src/components/PostHero.svelte` — CSS: title + deck glyph styling
- `packages/theme-blog/src/components/PostMeta.svelte` — template: avatar + filed-under; CSS: small caps, hairlines
- `packages/theme-blog/src/components/Sidebar.svelte` — CSS: brand Fraunces italic
- `packages/theme-blog/src/components/AuthorCard.svelte` — CSS: Fraunces display name, Ember surface
- `packages/theme-blog/src/components/TableOfContents.svelte` — CSS: small-caps label; template: mount `<SideRail />`
- `packages/theme-blog/src/parse-post.ts` — register `remark-directive`, `remarkPullQuote`, `rehypeFigure`

**Create:**
- `packages/theme-blog/src/components/SideRail.svelte` — vertical running text sticky inside TOC aside
- `packages/theme-blog/src/remark-pull-quote.ts` — container-directive `:::pull` → `<blockquote class="pull">`
- `packages/theme-blog/src/rehype-figure.ts` — paragraph-only image → `<figure><figcaption>{alt}</figcaption></figure>`
- `packages/theme-blog/__tests__/remark-pull-quote.test.ts`
- `packages/theme-blog/__tests__/rehype-figure.test.ts`
- `packages/example-blog/src/posts/editorial-showcase.md` — exercises drop cap, `---`, `:::pull`, figure

**Not touched:** `PostLayout.svelte` structure, `PostCard*`, `MasonryGrid`, `Timeline`, `Taxonomy*`, `Pagination`, `SearchModal`, `ReadingProgress.svelte` (already uses `var(--sp-blog-primary)` which is the Ember accent), `og-image.ts` (keeps using `@fontsource/inter` .woff for SSR).

---

## Task 1: Typography foundation

Adds Fraunces + browser-side Inter webfont imports and exposes `--sp-font-serif` / `--sp-font-sans` tokens. No visual change on posts yet — tokens are defined but only consumed by later tasks.

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `packages/theme-blog/package.json`
- Modify: `packages/theme-blog/src/components/GlobalLayout.svelte`

- [ ] **Step 1: Add `@fontsource-variable/fraunces` to the workspace catalog**

Open `pnpm-workspace.yaml`. Inside the `catalog:` block, add the new entry, keeping alphabetical order next to `@fontsource/inter`:

```yaml
  '@fontsource/inter': ^5.2.8
  '@fontsource-variable/fraunces': ^5.2.8
```

- [ ] **Step 2: Add `@fontsource-variable/fraunces` to theme-blog dependencies**

Open `packages/theme-blog/package.json`. Under `"dependencies"`, add the line, keeping alphabetical order (after `@fontsource/inter`):

```json
    "@fontsource/inter": "catalog:",
    "@fontsource-variable/fraunces": "catalog:",
```

- [ ] **Step 3: Install**

Run from the repo root:

```bash
pnpm install
```

Expected: no errors; `pnpm-lock.yaml` updated.

- [ ] **Step 4: Import fonts and declare CSS font tokens in `GlobalLayout.svelte`**

Open `packages/theme-blog/src/components/GlobalLayout.svelte`.

**(a) Add font CSS imports.** At the very top of the `<script lang="ts">` block (above `import type { Snippet }`), add:

```ts
import '@fontsource-variable/fraunces'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
```

**(b) Add the two font tokens to both palette blocks.** Find the `:global([data-theme='dark']) .sp-blog-root {` block (around line 153) and append two new variables inside it:

```css
  :global([data-theme='dark']) .sp-blog-root {
    --sp-blog-bg: #1a0a00;
    --sp-blog-surface: #2d1200;
    --sp-blog-border: #3f1c04;
    --sp-blog-text: #fff7ed;
    --sp-blog-muted: #a16207;
    --sp-blog-content: #d6d3d1;
    --sp-blog-primary: #fb923c;
    --sp-blog-secondary: #dc2626;
    --sp-font-serif: 'Fraunces Variable', Georgia, serif;
    --sp-font-sans: Inter, system-ui, sans-serif;
  }
```

Do the same inside `:global([data-theme='light']) .sp-blog-root {` — append the same two `--sp-font-*` lines (they're palette-independent; duplicating keeps each block self-contained).

**(c) Switch `.sp-blog-root` to the sans token.** Find:

```css
  .sp-blog-root {
    background: var(--sp-blog-bg, #1a0a00);
    color: var(--sp-blog-text, #fff7ed);
    font-family: Inter, system-ui, sans-serif;
```

Change the `font-family` line to:

```css
    font-family: var(--sp-font-sans);
```

- [ ] **Step 5: Verify the package builds**

Run:

```bash
pnpm -F @sveltepress/theme-blog build
```

Expected: completes without errors. (This just confirms imports resolve; nothing visual yet.)

- [ ] **Step 6: Commit**

```bash
git add pnpm-workspace.yaml packages/theme-blog/package.json pnpm-lock.yaml packages/theme-blog/src/components/GlobalLayout.svelte
git commit -m "feat(theme-blog): typography foundation — Fraunces + Inter tokens"
```

---

## Task 2: `remark-pull-quote` plugin (TDD)

Turns `:::pull … :::` container directives into `<blockquote class="pull">` so body CSS can render them as side-hanging pull quotes. Requires `remark-directive` upstream in the pipeline.

**Files:**
- Modify: `packages/theme-blog/package.json` (add `remark-directive`)
- Create: `packages/theme-blog/src/remark-pull-quote.ts`
- Create: `packages/theme-blog/__tests__/remark-pull-quote.test.ts`
- Modify: `packages/theme-blog/src/parse-post.ts` (register both)

- [ ] **Step 1: Add `remark-directive` dep**

In `packages/theme-blog/package.json`, add under `"dependencies"`, alphabetical order (between `remark-gfm` and `remark-parse` is where it will land alphabetically — insert `remark-directive` first):

```json
    "remark-directive": "catalog:",
    "remark-gfm": "catalog:",
```

Already present in the catalog (`pnpm-workspace.yaml` line 75: `remark-directive: ^4.0.0`), so no workspace edit needed.

Install:

```bash
pnpm install
```

- [ ] **Step 2: Write the failing test**

Create `packages/theme-blog/__tests__/remark-pull-quote.test.ts`:

```ts
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { remarkPullQuote } from '../src/remark-pull-quote.js'

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkPullQuote)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('remarkPullQuote', () => {
  it('transforms a :::pull container into a blockquote.pull', async () => {
    const html = await process(':::pull\nA quote that stops you cold.\n:::')
    expect(html).toContain('<blockquote class="pull">')
    expect(html).toContain('A quote that stops you cold.')
    expect(html).toContain('</blockquote>')
  })

  it('supports inline content and leaves non-pull directives alone', async () => {
    const html = await process(
      ':::pull\nLegibility isn\'t a **style** — it\'s a posture.\n:::\n\n:::other\nx\n:::',
    )
    expect(html).toContain('<blockquote class="pull">')
    expect(html).toContain('<strong>style</strong>')
    // Non-pull directive is left in some untransformed/raw form — MUST NOT become blockquote.pull
    expect(html.match(/<blockquote class="pull">/g)?.length).toBe(1)
  })

  it('passes through plain markdown unchanged', async () => {
    const html = await process('Just a paragraph.')
    expect(html).toContain('<p>Just a paragraph.</p>')
    expect(html).not.toContain('blockquote')
  })
})
```

- [ ] **Step 3: Run the test — expect failure**

Run:

```bash
pnpm -F @sveltepress/theme-blog test -- remark-pull-quote
```

Expected: test fails with `Cannot find module '../src/remark-pull-quote.js'` or similar.

- [ ] **Step 4: Implement the plugin**

Create `packages/theme-blog/src/remark-pull-quote.ts`:

```ts
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Turns `:::pull …body… :::` container directives into a
 * `<blockquote class="pull">…</blockquote>` HAST element on render.
 *
 * Requires `remark-directive` upstream to produce the directive nodes.
 */
export function remarkPullQuote() {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective') return
      if (node.name !== 'pull') return

      const data = (node.data ||= {})
      data.hName = 'blockquote'
      data.hProperties = { className: ['pull'] }
    })
  }
}
```

- [ ] **Step 5: Run the test — expect pass**

Run:

```bash
pnpm -F @sveltepress/theme-blog test -- remark-pull-quote
```

Expected: all three tests PASS.

- [ ] **Step 6: Register in the post pipeline**

Open `packages/theme-blog/src/parse-post.ts`. Update imports (add two lines):

```ts
import type { BlogPost } from './types.js'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import { readingTime } from './reading-time.js'
import { rehypeHeadingIds } from './rehype-heading-ids.js'
import { remarkCodeBlocks } from './remark-code-blocks.js'
import { remarkPullQuote } from './remark-pull-quote.js'
```

Update the processor chain — insert `remarkDirective` after `remarkGfm`, and `remarkPullQuote` right after it:

```ts
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkPullQuote)
  .use(remarkCodeBlocks)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeHeadingIds)
  .use(rehypeStringify, { allowDangerousHtml: true })
```

- [ ] **Step 7: Run the full theme-blog test suite — expect no regressions**

```bash
pnpm -F @sveltepress/theme-blog test
```

Expected: all existing tests still PASS (parse-post, remark-code-blocks, etc.).

- [ ] **Step 8: Commit**

```bash
git add packages/theme-blog/package.json pnpm-lock.yaml \
        packages/theme-blog/src/remark-pull-quote.ts \
        packages/theme-blog/__tests__/remark-pull-quote.test.ts \
        packages/theme-blog/src/parse-post.ts
git commit -m "feat(theme-blog): remark-pull-quote directive for editorial pull quotes"
```

---

## Task 3: `rehype-figure` plugin (TDD)

Rewrites paragraphs whose only child is an `<img alt="…">` into `<figure><img…/><figcaption>{alt}</figcaption></figure>`. Per-post figure numbering is handled purely in CSS (Task 4) via `counter-increment`.

**Files:**
- Create: `packages/theme-blog/src/rehype-figure.ts`
- Create: `packages/theme-blog/__tests__/rehype-figure.test.ts`
- Modify: `packages/theme-blog/src/parse-post.ts` (register after `remarkRehype`)

- [ ] **Step 1: Write the failing test**

Create `packages/theme-blog/__tests__/rehype-figure.test.ts`:

```ts
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { rehypeFigure } from '../src/rehype-figure.js'

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFigure)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('rehypeFigure', () => {
  it('wraps an image-only paragraph into a figure with figcaption from alt', async () => {
    const html = await process('![A readable diff is cheap docs.](/img.png)')
    expect(html).toContain('<figure>')
    expect(html).toContain('<img')
    expect(html).toContain('src="/img.png"')
    expect(html).toContain('alt="A readable diff is cheap docs."')
    expect(html).toContain('<figcaption>A readable diff is cheap docs.</figcaption>')
    expect(html).toContain('</figure>')
    // The original paragraph wrapper must be gone
    expect(html).not.toMatch(/<p>\s*<img/)
  })

  it('skips images without alt text', async () => {
    const html = await process('![](/img.png)')
    expect(html).not.toContain('<figure>')
    expect(html).not.toContain('<figcaption>')
    expect(html).toContain('<img')
  })

  it('skips paragraphs that also contain text', async () => {
    const html = await process('Text before ![caption](/img.png) text after.')
    expect(html).not.toContain('<figure>')
    expect(html).toContain('<img')
  })

  it('handles multiple figure paragraphs in one doc', async () => {
    const html = await process(
      '![First.](/a.png)\n\nSome prose.\n\n![Second.](/b.png)',
    )
    expect(html.match(/<figure>/g)?.length).toBe(2)
    expect(html).toContain('<figcaption>First.</figcaption>')
    expect(html).toContain('<figcaption>Second.</figcaption>')
  })
})
```

- [ ] **Step 2: Run the test — expect failure**

```bash
pnpm -F @sveltepress/theme-blog test -- rehype-figure
```

Expected: fails, module not found.

- [ ] **Step 3: Implement the plugin**

Create `packages/theme-blog/src/rehype-figure.ts`:

```ts
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * rehype plugin: rewrite any `<p>` whose only element child is a single
 * `<img alt="…">` into `<figure><img…/><figcaption>{alt}</figcaption></figure>`.
 *
 * Whitespace-only text nodes inside the paragraph are allowed; any other
 * content disqualifies the paragraph.
 *
 * Per-post caption numbering (`Fig. 01 ·`) is applied in CSS via a counter.
 */
export function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'p') return

      const children = node.children ?? []
      const elementChildren = children.filter(c => c.type === 'element')
      if (elementChildren.length !== 1) return

      const nonWhitespaceText = children.some(
        c => c.type === 'text' && /\S/.test(c.value),
      )
      if (nonWhitespaceText) return

      const img = elementChildren[0] as Element
      if (img.tagName !== 'img') return

      const alt = (img.properties?.alt as string | undefined)?.trim()
      if (!alt) return

      const figcaption: Element = {
        type: 'element',
        tagName: 'figcaption',
        properties: {},
        children: [{ type: 'text', value: alt }],
      }

      node.tagName = 'figure'
      node.properties = {}
      node.children = [img, figcaption]
    })
  }
}
```

- [ ] **Step 4: Run the test — expect pass**

```bash
pnpm -F @sveltepress/theme-blog test -- rehype-figure
```

Expected: all four tests PASS.

- [ ] **Step 5: Register in the post pipeline**

Open `packages/theme-blog/src/parse-post.ts`. Add the import:

```ts
import { rehypeFigure } from './rehype-figure.js'
import { rehypeHeadingIds } from './rehype-heading-ids.js'
```

(Keep alphabetical order — `rehypeFigure` goes above `rehypeHeadingIds`.)

Insert `rehypeFigure` in the chain between `remarkRehype` and `rehypeHeadingIds`:

```ts
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkPullQuote)
  .use(remarkCodeBlocks)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeFigure)
  .use(rehypeHeadingIds)
  .use(rehypeStringify, { allowDangerousHtml: true })
```

- [ ] **Step 6: Run the full suite**

```bash
pnpm -F @sveltepress/theme-blog test
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/theme-blog/src/rehype-figure.ts \
        packages/theme-blog/__tests__/rehype-figure.test.ts \
        packages/theme-blog/src/parse-post.ts
git commit -m "feat(theme-blog): rehype-figure wraps captioned images in <figure>"
```

---

## Task 4: Editorial body prose styles

Adds every editorial body-copy rule to `GlobalLayout.svelte` as `.sp-post-content :global(...)` selectors: Fraunces body, Fraunces headings, drop cap on lead `<p>`, § glyph `<hr>`, side-hang `<blockquote class="pull">`, `<figure>` with numbered `<figcaption>`.

**Files:**
- Modify: `packages/theme-blog/src/components/GlobalLayout.svelte`

- [ ] **Step 1: Add the editorial body-styles block**

Open `packages/theme-blog/src/components/GlobalLayout.svelte`. Find the end of the existing `:global(a:hover)` rule (~line 223):

```css
  :global(a:hover) {
    text-decoration: underline;
  }

  .sp-blog-main {
```

Insert the following new block **between** `:global(a:hover)` and `.sp-blog-main`:

```css
  /* ── Editorial post body (Fraunces) ─────────────────────── */
  .sp-blog-root :global(.sp-post-content) {
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 14, 'wght' 400, 'SOFT' 30, 'WONK' 0;
    font-size: 1.0625rem; /* 17px */
    line-height: 1.62;
    color: var(--sp-blog-content);
    counter-reset: figure;
  }

  .sp-blog-root :global(.sp-post-content p) {
    margin: 0 0 1.15rem;
  }

  /* Drop cap on the lead paragraph */
  .sp-blog-root :global(.sp-post-content > p:first-of-type::first-letter) {
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 144, 'wght' 700, 'SOFT' 100, 'WONK' 1;
    float: left;
    font-size: 4.5rem;
    line-height: 0.85;
    padding: 0.25rem 0.6rem 0 0;
    color: var(--sp-blog-primary);
  }

  /* Fraunces display headings — overrides the base PostLayout h2/h3 rules */
  .sp-blog-root :global(.sp-post-content h2),
  .sp-blog-root :global(.sp-post-content h3) {
    font-family: var(--sp-font-serif);
    color: var(--sp-blog-text);
    letter-spacing: -0.01em;
  }
  .sp-blog-root :global(.sp-post-content h2) {
    font-variation-settings: 'opsz' 72, 'wght' 600, 'SOFT' 70, 'WONK' 1;
    font-size: 1.625rem;
    line-height: 1.14;
    margin: 2rem 0 0.875rem;
  }
  .sp-blog-root :global(.sp-post-content h3) {
    font-variation-settings: 'opsz' 48, 'wght' 600, 'SOFT' 70, 'WONK' 1;
    font-size: 1.25rem;
    line-height: 1.2;
    margin: 1.75rem 0 0.75rem;
  }

  /* § section glyph divider — replaces the default <hr> */
  .sp-blog-root :global(.sp-post-content hr) {
    border: none;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    margin: 2rem 0;
    color: var(--sp-blog-muted);
    overflow: visible;
  }
  .sp-blog-root :global(.sp-post-content hr::before),
  .sp-blog-root :global(.sp-post-content hr::after) {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--sp-blog-border);
  }
  .sp-blog-root :global(.sp-post-content hr::after) {
    content: '';
  }
  .sp-blog-root :global(.sp-post-content hr::before) {
    content: '§';
    flex: 0 0 auto;
    height: auto;
    background: none;
    order: 0;
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 48, 'wght' 600, 'SOFT' 100, 'WONK' 1;
    font-style: italic;
    font-size: 1.25rem;
    color: var(--sp-blog-primary);
    padding: 0 0.5rem;
  }

  /* Side-hanging pull quote (inside body column) */
  .sp-blog-root :global(.sp-post-content blockquote.pull) {
    margin: 1.75rem 0;
    padding: 0.75rem 0 0.75rem 1.25rem;
    border-left: 3px solid var(--sp-blog-primary);
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 60, 'wght' 500, 'SOFT' 90, 'WONK' 1;
    font-style: italic;
    font-size: 1.375rem;
    line-height: 1.3;
    color: var(--sp-blog-text);
  }
  .sp-blog-root :global(.sp-post-content blockquote.pull p) {
    margin: 0 0 0.5rem;
  }
  .sp-blog-root :global(.sp-post-content blockquote.pull p:last-child) {
    margin-bottom: 0;
  }

  /* Figures with numbered captions */
  .sp-blog-root :global(.sp-post-content figure) {
    margin: 2rem 0;
    counter-increment: figure;
  }
  .sp-blog-root :global(.sp-post-content figure img) {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 4px;
  }
  .sp-blog-root :global(.sp-post-content figure figcaption) {
    margin-top: 0.5rem;
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 14, 'wght' 400, 'SOFT' 60, 'WONK' 1;
    font-style: italic;
    font-size: 0.8125rem;
    color: var(--sp-blog-muted);
    padding-left: 0.875rem;
    text-indent: -0.875rem;
  }
  .sp-blog-root :global(.sp-post-content figure figcaption::before) {
    content: 'Fig. ' counter(figure, decimal-leading-zero) ' · ';
    font-family: var(--sp-font-sans);
    font-style: normal;
    font-size: 0.625rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sp-blog-primary);
  }
```

- [ ] **Step 2: Verify the package builds**

```bash
pnpm -F @sveltepress/theme-blog build
```

Expected: builds without errors. (CSS change is inside an existing `<style>` block; Svelte will accept the new `:global(...)` selectors.)

- [ ] **Step 3: Run tests to verify nothing broke**

```bash
pnpm -F @sveltepress/theme-blog test
```

Expected: all tests still PASS (these are pure-CSS changes, no unit-testable logic).

- [ ] **Step 4: Commit**

```bash
git add packages/theme-blog/src/components/GlobalLayout.svelte
git commit -m "feat(theme-blog): editorial body prose — drop cap, section glyph, pull quote, figure"
```

---

## Task 5: Restyle PostHero (title + deck)

Swap the title + subtitle to Fraunces display glyphs. VT names unchanged; element structure unchanged; aspect ratio + overlay unchanged. Only the font-family / -variation-settings / -size change.

**Files:**
- Modify: `packages/theme-blog/src/components/PostHero.svelte`

- [ ] **Step 1: Swap title + subtitle styling**

Open `packages/theme-blog/src/components/PostHero.svelte`. Replace the `.sp-post-hero__title` and `.sp-post-hero__subtitle` rules (the current ones use `font-weight: 900` and plain text) with:

```css
  .sp-post-hero__title {
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 144, 'wght' 600, 'SOFT' 60, 'WONK' 1;
    font-size: clamp(1.75rem, 4.5vw, 2.625rem);
    font-weight: 600;
    color: #fff7ed;
    line-height: 1.02;
    letter-spacing: -0.018em;
  }
  .sp-post-hero__subtitle {
    margin-top: 0.625rem;
    max-width: 52ch;
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 36, 'wght' 400, 'SOFT' 100, 'WONK' 1;
    font-style: italic;
    font-size: clamp(0.95rem, 1.4vw, 1.0625rem);
    color: #fde8c8;
    line-height: 1.4;
  }
  .sp-post-hero__subtitle:empty {
    display: none;
  }
```

Also update `.sp-post-hero__cat` to use the sans token and small-caps treatment:

```css
  .sp-post-hero__cat {
    font-family: var(--sp-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    color: #fdba74;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    margin-bottom: 0.625rem;
  }
```

- [ ] **Step 2: Build + test**

```bash
pnpm -F @sveltepress/theme-blog build
pnpm -F @sveltepress/theme-blog test
```

Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/PostHero.svelte
git commit -m "feat(theme-blog): PostHero title + deck in Fraunces display"
```

---

## Task 6: Restyle PostMeta (small caps + filed-under)

Adds avatar + "Filed under {category}" trailing chip, converts the row to Inter small-caps with top/bottom hairline rules. Keeps tags and VT names (`sp-date-{slug}`, `sp-reading-{slug}`, `sp-tag-{slug}-{i}`).

**Files:**
- Modify: `packages/theme-blog/src/components/PostMeta.svelte`

- [ ] **Step 1: Replace the file's contents**

Replace the entire contents of `packages/theme-blog/src/components/PostMeta.svelte` with:

```svelte
<!-- src/components/PostMeta.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { base } from '$app/paths'
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  interface Props {
    post: BlogPost
  }

  const { post }: Props = $props()
  const avatar = $derived(blogConfig.author?.avatar)

  function href(to: string) {
    if (/^(?:[a-z]+:)?\/\//i.test(to)) return to
    return to.startsWith('/') ? `${base}${to}` : to
  }
</script>

<div class="sp-post-meta">
  {#if avatar}
    <img class="sp-post-meta__avatar" src={href(avatar)} alt="" width="24" height="24" />
  {/if}
  {#if post.author}
    <span class="sp-post-meta__author">By <b>{post.author}</b></span>
    <span class="sp-post-meta__sep">·</span>
  {/if}
  <time
    class="sp-post-meta__date"
    style="view-transition-name: sp-date-{post.slug}">{post.date}</time
  >
  <span class="sp-post-meta__sep">·</span>
  <span style="view-transition-name: sp-reading-{post.slug}"
    >{post.readingTime} min read</span
  >
  {#if post.category}
    <span class="sp-post-meta__sep">·</span>
    <span class="sp-post-meta__filed">Filed under <b>{post.category}</b></span>
  {/if}
  {#if post.tags.length}
    <div class="sp-post-meta__tags">
      {#each post.tags as tag, i (tag)}
        <a
          href={`${base}/tags/${tag}/`}
          class="sp-post-meta__tag"
          style="view-transition-name: sp-tag-{post.slug}-{i}">{tag}</a
        >
      {/each}
    </div>
  {/if}
</div>

<style>
  .sp-post-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    padding: 0.875rem 0;
    border-top: 1px solid var(--sp-blog-border);
    border-bottom: 1px solid var(--sp-blog-border);
    margin-bottom: 1.75rem;
    font-family: var(--sp-font-sans);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sp-blog-muted);
  }
  .sp-post-meta__avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }
  .sp-post-meta__sep {
    color: var(--sp-blog-border);
  }
  .sp-post-meta__author b,
  .sp-post-meta__filed b {
    font-weight: 600;
    color: var(--sp-blog-text);
  }
  .sp-post-meta__tags {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    margin-left: auto;
  }
  .sp-post-meta__tag {
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    color: var(--sp-blog-primary);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
  }
  .sp-post-meta__tag:hover {
    background: var(--sp-blog-border);
  }
</style>
```

- [ ] **Step 2: Build + test**

```bash
pnpm -F @sveltepress/theme-blog build
pnpm -F @sveltepress/theme-blog test
```

Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/PostMeta.svelte
git commit -m "feat(theme-blog): PostMeta small-caps editorial row with avatar + filed-under"
```

---

## Task 7: Sidebar brand Fraunces italic

Only the brand wordmark changes — nav/profile/search/kbd remain on the existing Inter stack (now via `--sp-font-sans`, inherited).

**Files:**
- Modify: `packages/theme-blog/src/components/Sidebar.svelte`

- [ ] **Step 1: Restyle the brand**

Open `packages/theme-blog/src/components/Sidebar.svelte`. Find the `.sp-sidebar__brand` rule (~line 157):

```css
  .sp-sidebar__brand {
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--sp-blog-primary);
    letter-spacing: -0.02em;
    text-decoration: none;
  }
```

Replace it with:

```css
  .sp-sidebar__brand {
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 144, 'wght' 700, 'SOFT' 80, 'WONK' 1;
    font-style: italic;
    font-size: 1.5rem;
    line-height: 1;
    color: var(--sp-blog-primary);
    letter-spacing: -0.01em;
    text-decoration: none;
  }
```

- [ ] **Step 2: Build**

```bash
pnpm -F @sveltepress/theme-blog build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/Sidebar.svelte
git commit -m "feat(theme-blog): sidebar brand in Fraunces italic"
```

---

## Task 8: Restyle AuthorCard

Ember surface, Fraunces display name, Inter bio.

**Files:**
- Modify: `packages/theme-blog/src/components/AuthorCard.svelte`

- [ ] **Step 1: Replace the `<style>` block**

Open `packages/theme-blog/src/components/AuthorCard.svelte`. Replace the entire `<style>` block with:

```css
<style>
  .sp-author {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    margin-top: 2.25rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
    background: var(--sp-blog-surface);
  }
  .sp-author__avatar {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
  }
  .sp-author__name {
    font-family: var(--sp-font-serif);
    font-variation-settings: 'opsz' 48, 'wght' 600, 'SOFT' 70, 'WONK' 1;
    font-size: 1.125rem;
    color: var(--sp-blog-text);
    margin: 0 0 0.25rem;
  }
  .sp-author__bio {
    font-family: var(--sp-font-sans);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--sp-blog-muted);
    margin: 0;
  }
</style>
```

(Note: `align-items` changes from `center` → `flex-start` so the bio sits naturally under the name; avatar border ring removed — the Ember surface already provides enough separation.)

- [ ] **Step 2: Build**

```bash
pnpm -F @sveltepress/theme-blog build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/components/AuthorCard.svelte
git commit -m "feat(theme-blog): AuthorCard editorial restyle"
```

---

## Task 9: SideRail component + TableOfContents integration

Adds the vertical running "Issue · {blogTitle} · {category}" text inside the TOC aside, and retreats the TOC label to small-caps Inter.

**Files:**
- Create: `packages/theme-blog/src/components/SideRail.svelte`
- Modify: `packages/theme-blog/src/components/TableOfContents.svelte`

- [ ] **Step 1: Create `SideRail.svelte`**

Create `packages/theme-blog/src/components/SideRail.svelte`:

```svelte
<!-- src/components/SideRail.svelte -->
<!-- Vertical "Issue · {blogTitle} · {category}" text sticky inside the TOC
     aside. Pure decorative editorial signature; hidden when no category. -->
<script lang="ts">
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  interface Props {
    category?: string
  }

  const { category }: Props = $props()
  const blogTitle = $derived(blogConfig.title ?? 'Blog')
</script>

{#if category}
  <div class="sp-siderail" aria-hidden="true">
    Issue · {blogTitle} · {category}
  </div>
{/if}

<style>
  .sp-siderail {
    position: absolute;
    top: 0;
    right: 0;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-family: var(--sp-font-sans);
    font-size: 0.625rem;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--sp-blog-muted);
    opacity: 0.55;
    pointer-events: none;
  }
</style>
```

- [ ] **Step 2: Wire `SideRail` into the TOC**

Open `packages/theme-blog/src/components/TableOfContents.svelte`.

**(a) Add a prop so the TOC knows the post's category.** In the current `<script lang="ts">` block, add the `SideRail` import below the existing `onMount, tick` import, and add a `Props` interface + `$props()` destructuring immediately below the imports:

```ts
  import { onMount, tick } from 'svelte'
  import SideRail from './SideRail.svelte'

  interface Props {
    category?: string
  }

  const { category }: Props = $props()
```

Leave every other line of the existing `<script>` (the `Heading` interface, the `headings`/`activeId` `$state` declarations, the entire `onMount` body) exactly as-is.

**(b) Wrap the markup so `SideRail` sits inside the same sticky aside.** Replace the current template:

```svelte
{#if headings.length}
  <nav class="sp-toc">
    <p class="sp-toc__label">目录</p>
    <ul>
      ...
    </ul>
  </nav>
{/if}
```

with:

```svelte
<div class="sp-toc-wrap">
  <SideRail {category} />
  {#if headings.length}
    <nav class="sp-toc">
      <p class="sp-toc__label">On this page</p>
      <ul>
        {#each headings as h}
          <li class="sp-toc__item" class:sp-toc__item--h3={h.level === 3}>
            <a
              href={`#${h.id}`}
              class="sp-toc__link"
              class:sp-toc__link--active={activeId === h.id}>{h.text}</a
            >
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>
```

(Label changes from `目录` → `On this page` to match the editorial voice; it is consistent with the mockup and is an English-theme default. The docs-site-zh/bn translations do not consume this string — it lives inside the theme package itself and was already English-adjacent.)

**(c) Add CSS for the wrapper and restyle the label.** Replace the existing `<style>` block top-to-bottom with:

```css
<style>
  .sp-toc-wrap {
    position: sticky;
    top: 80px;
    min-height: 220px;
  }
  .sp-toc {
    font-family: var(--sp-font-sans);
    font-size: 0.8rem;
    padding-right: 1rem; /* reserve room for the vertical rail */
  }
  .sp-toc__label {
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: var(--sp-blog-muted);
    margin-bottom: 0.75rem;
    padding-left: 0.85rem;
  }
  .sp-toc ul {
    list-style: none;
    padding: 0;
    margin: 0;
    border-left: 2px solid var(--sp-blog-border);
  }
  .sp-toc__item {
    position: relative;
    margin: 0;
  }
  .sp-toc__link {
    display: block;
    padding: 0.3rem 0.85rem;
    margin-left: -2px;
    border-left: 2px solid transparent;
    color: var(--sp-blog-muted);
    text-decoration: none;
    line-height: 1.4;
    letter-spacing: 0;
    text-transform: none;
    font-weight: 400;
    transition:
      color 0.15s,
      border-color 0.15s;
  }
  .sp-toc__item--h3 .sp-toc__link {
    padding-left: 1.6rem;
  }
  .sp-toc__link:hover {
    color: var(--sp-blog-text);
  }
  .sp-toc__link--active {
    color: var(--sp-blog-primary);
    border-left-color: var(--sp-blog-primary);
    font-weight: 500;
  }
</style>
```

- [ ] **Step 3: Pass the category from `PostLayout` into the TOC**

Open `packages/theme-blog/src/components/PostLayout.svelte`. Find the TOC render (~line 100):

```svelte
    <aside class="sp-post__toc">
      <TableOfContents />
    </aside>
```

Change it to:

```svelte
    <aside class="sp-post__toc">
      <TableOfContents category={post.category} />
    </aside>
```

- [ ] **Step 4: Build + test**

```bash
pnpm -F @sveltepress/theme-blog build
pnpm -F @sveltepress/theme-blog test
```

Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/components/SideRail.svelte \
        packages/theme-blog/src/components/TableOfContents.svelte \
        packages/theme-blog/src/components/PostLayout.svelte
git commit -m "feat(theme-blog): vertical side-rail inside TOC aside"
```

---

## Task 10: Example post exercising every treatment

Adds one post to `example-blog` that triggers every new treatment (drop cap, `---` `<hr>` → § divider, `:::pull`, `![caption](url)` figure, h2/h3 headings). Required for the next task's visual verification.

**Files:**
- Create: `packages/example-blog/src/posts/editorial-showcase.md`

- [ ] **Step 1: Create the showcase post**

Create `packages/example-blog/src/posts/editorial-showcase.md`:

```md
---
title: Building ships in daylight
date: 2026-04-17
tags: [craft, process]
category: Engineering
author: Demo Author
excerpt: Shipping without theatrics starts with how you frame the risk before the first commit.
cover: https://picsum.photos/seed/daylight/1200/540
---

Shipping fast without breaking things is less about speed and more about confidence. The confidence comes from making each change legible — to yourself, to your reviewers, to the person who will be oncall when something goes wrong at 3am.

Most teams treat "ship fast" and "ship safe" as a tradeoff. A better frame is to treat legibility as the lever: a legible change, visible at every layer from commit message to dashboard, is both fast and safe.

---

## The three windows

Every change passes through three windows before it is real. The _review_ window judges shape. The _rollout_ window judges your assumption about production. The _maintenance_ window is where future-you figures out why.

:::pull
Legibility isn't a style — it is an operational posture you can measure, one commit at a time.
:::

Teams that ship well build rituals around all three windows. Teams that ship poorly optimize the first two and ignore the third, then wonder why their codebases feel like attics.

![A readable diff is the cheapest form of documentation a team can produce.](https://picsum.photos/seed/diff/1200/675)

When the cost of legibility is paid at write time, every downstream reader benefits.

## Making it routine

The practice is small and boring: write the commit message you'd want to read six months from now, write the rollout plan that answers "what graph tells me if this is wrong," and leave the code in a state where the next person doesn't need to ask.

![The maintenance window is longer than the first two combined.](https://picsum.photos/seed/attic/1200/675)

Daylight, then, is just legibility made into a habit.
```

- [ ] **Step 2: Sanity-check the post parses**

Run from the repo root:

```bash
pnpm -F @sveltepress/theme-blog test -- parse-post
```

Expected: existing `parse-post.test.ts` still passes (confirms nothing in the pipeline regresses on a real post).

- [ ] **Step 3: Commit**

```bash
git add packages/example-blog/src/posts/editorial-showcase.md
git commit -m "docs(example-blog): showcase post exercising editorial treatments"
```

---

## Task 11: Visual verification in the browser

End-to-end check. Start the example-blog dev server, open the showcase post, and confirm every treatment lands AND the card↔post VT morph still works. Must be done via an **agent-browser subagent** per `~/.claude/CLAUDE.md` (screenshots never reach the main context).

**Files:** None written; this is a verification task.

- [ ] **Step 1: Start the example-blog dev server**

From the repo root, in a second terminal (or with `run_in_background: true`):

```bash
pnpm -F @sveltepress/example-blog dev
```

Expected: Vite reports a local URL, typically `http://localhost:4173` or `http://localhost:5173`. Note the port.

- [ ] **Step 2: Dispatch an agent-browser subagent to verify the post page**

Dispatch a fresh subagent via the `Agent` tool (general-purpose, `model: "sonnet"`) with a self-contained prompt like:

> You are verifying a new editorial design on a blog theme. Start the agent-browser and navigate to `http://localhost:<port>/posts/editorial-showcase/`. Use `get text` / `is visible` / `eval` commands (not screenshots) to confirm the following, and return a short text report:
>
> 1. The post hero title is present and rendered in a serif font (check `getComputedStyle(...).fontFamily` contains `Fraunces`).
> 2. The first paragraph of `.sp-post-content` has a `::first-letter` that is float-left and >= 60px (drop cap).
> 3. `.sp-post-content hr` exists and, by computed style, has `display: flex` (styled divider).
> 4. A `blockquote.pull` exists inside `.sp-post-content` with a left border in Ember orange.
> 5. At least one `<figure>` with a `<figcaption>` exists; `getComputedStyle(figcaption, '::before').content` contains `"Fig."`.
> 6. `.sp-siderail` exists inside `.sp-post__toc` and has `writingMode: vertical-rl`.
> 7. The sidebar `.sp-sidebar__brand` uses Fraunces.
> 8. Take ONE screenshot of the whole post for the report and describe it in text (layout, colors, deltas) — then drop it. Do NOT attach raw images.
>
> Then navigate to the homepage `/` and click the `editorial-showcase` post card. Report whether the cover image appears to morph (not fade) — i.e., the transition carried across documents.

- [ ] **Step 3: Review the subagent report; fix or patch any failures**

If any of 1–7 report negative, identify which earlier task produced the regression, patch, and re-run Step 2. If only 8 (the VT morph) is degraded, that's a VT issue: inspect the computed `view-transition-name` on the hero elements (`sp-cover-{slug}`, `sp-title-{slug}`, `sp-excerpt-{slug}`) and confirm they match the card's. **Do not** accept partial success.

- [ ] **Step 4: Stop the dev server**

If backgrounded, kill with `TaskStop`. Otherwise `Ctrl+C` the second terminal.

- [ ] **Step 5: Changeset + commit**

All user-facing PRs in this repo require a changeset (per the `@sveltepress/theme-blog` publishing pipeline). Generate one:

```bash
pnpm changeset
```

When prompted: select `@sveltepress/theme-blog`, pick `minor` (new feature), and write the summary: `Editorial design system — Fraunces typography, drop cap, § divider, pull quote, figure captions, side-rail.`

Then commit:

```bash
git add .changeset/
git commit -m "chore: changeset for theme-blog editorial design"
```

---

## Self-Review

**Spec coverage:**
- Typography setup (§3.1) → Task 1 ✓
- PostHero title/deck restyle → Task 5 ✓
- PostMeta small-caps + filed-under → Task 6 ✓
- ReadingProgress retint → already in place (uses `--sp-blog-primary` = `#fb923c`); noted in File Structure. ✓
- Sidebar brand italic → Task 7 ✓
- AuthorCard restyle → Task 8 ✓
- TableOfContents label + SideRail → Task 9 ✓
- SideRail component → Task 9 ✓
- `.sp-post-content` body styles (Fraunces, drop cap, hr §, blockquote.pull, figure+counter) → Task 4 ✓
- `remark-pull-quote.ts` + test → Task 2 ✓
- `rehype-figure.ts` + test → Task 3 ✓
- Example post → Task 10 ✓
- Visual verification → Task 11 ✓

**Type consistency:**
- `remarkPullQuote` / `rehypeFigure` exported names match import sites in `parse-post.ts`.
- `SideRail` prop `category?: string` matches `TableOfContents` prop and `PostLayout` usage.
- `blogConfig.author.avatar` — same shape as used in `Sidebar.svelte:79`.
- `post.category` type — already a string on `BlogPost`; consumed in PostHero.svelte:25 today.

**Placeholder scan:** No TBDs, no "add error handling," no bare "similar to Task N" — every step has exact code or exact command.
