# Blog theme — editorial design system

**Date:** 2026-04-17
**Package:** `@sveltepress/theme-blog`
**Builds on:** `2026-04-16-blog-theme-design.md` (base theme), the three `feat(theme-blog): morph view transitions` commits on `feat/blog-theme-view-transitions` (card↔post morph).

## Problem

The current theme is functionally complete (sidebar + masonry grid + post page + VT morph) but visually generic — it reads like a scaffolded SvelteKit blog, not like something someone *designed*. The goal is a magazine-grade editorial personality: readers should recognise this as "the Sveltepress blog theme" after two seconds of scrolling, and visitors should feel the typographic craft on the post page itself.

Two non-negotiable constraints:

1. **Layout stays.** No structural change to Sidebar / Article / TOC-aside columns. No new top-level grid tracks. All treatments must live inside the columns that already exist.
2. **View transitions stay.** The three VT-named elements on the post page — `sp-cover-{slug}`, `sp-title-{slug}`, `sp-excerpt-{slug}` — keep their names, their positions, and their aspect ratios. The morph from card to post hero must continue to work unmodified.

Everything in this spec is additive CSS, one narrow set of new components, and two small markdown-pipeline extensions.

## Direction

**Editorial magazine** — the feel of a printed long-read section, adapted to a web reading column. Specifically:

- **Type pair:** Fraunces (variable serif, axes `opsz 9–144`, `wght 300–900`, `SOFT 0–100`, `WONK 0–1`) for display + body; Inter for UI chrome, labels, meta. Both OFL, free, on Google Fonts, self-hostable via `@fontsource-variable/fraunces` + `@fontsource-variable/inter`.
- **Palette:** keep the existing Ember palette (bg `#14100c`, accent `#fb923c`, ink `#f5efe8`, muted `#a89380`). No new colour tokens.
- **Signature moves:** drop cap on lead paragraph, italic display deck, § section glyph divider, side-hanging pull quote within the body column, numbered figure captions (`Fig. 01 ·`), vertical running side-rail inside the TOC aside, small-caps meta, italic Fraunces sidebar brand.

## Compatibility audit (what changes, what doesn't)

Twelve editorial treatments were evaluated against the current layout + VT. Result:

| # | Treatment | Status | Where / how |
|---|---|---|---|
| 1 | Reading progress bar | KEEP | Existing `ReadingProgress.svelte` — retint to Ember accent only |
| 2 | Hero cover + overlay | KEEP | Existing `PostHero` — `sp-cover-{slug}` VT unchanged |
| 3 | Display title font | KEEP | Restyle `.sp-post-hero__title` glyphs only — `sp-title-{slug}` VT unchanged |
| 4 | Italic deck (subtitle) | KEEP | Restyle `.sp-post-hero__subtitle` — `sp-excerpt-{slug}` VT unchanged |
| 5 | Category/date chip row | KEEP | Restyle `PostMeta.svelte` (small caps, avatar, filed-under chip) |
| 6 | Drop cap | KEEP | Pure CSS: `.sp-post-content > p:first-of-type::first-letter` |
| 7 | § section glyph divider | KEEP | Style markdown `<hr>` with `::before/::after` hairlines + glyph |
| 8 | Pull quote | ADAPT | Constrain to body column width (no bleed into TOC). Remark directive `:::pull` |
| 9 | Figure + numbered caption | ADAPT | Small rehype plugin wrapping `<img alt>` → `<figure><figcaption>`, autonumbers per post |
| 10 | Running side-rail | ADAPT | Moves into TOC aside (no free gutter on article column). Sticky, `writing-mode: vertical-rl` |
| 11 | Author card | KEEP | Existing `AuthorCard.svelte` — restyle only |
| 12 | Post masthead | DROP | Redundant with Sidebar brand. Italic Fraunces treatment moves into Sidebar |

Full mockup (layout-correct, compatibility-audited): `.superpowers/brainstorm/86602-1776408412/content/post-mockup-compat.html`.

## Architecture

### 1. Typography setup (one place)

The theme's global styles live in `packages/theme-blog/src/components/GlobalLayout.svelte`. Today it declares `font-family: Inter, system-ui, sans-serif` but does **not** actually import the Inter webfont for the browser — it relies on the user having Inter installed, or falls through to `system-ui`. OG image rendering separately imports `@fontsource/inter` in `og-image.ts`; that stays untouched.

Changes:

- Add new dep `@fontsource-variable/fraunces`. Import its CSS at the top of the `<script>` in `GlobalLayout.svelte`.
- Add the browser CSS import for Inter: `import '@fontsource/inter/400.css'` (and `500`, `600`, `700` as needed) in the same place. The `@fontsource/inter` package is already installed.
- Define CSS custom properties on `.sp-blog-root` (extending the existing Ember token block):

```css
--sp-font-serif: 'Fraunces Variable', Georgia, serif;
--sp-font-sans:  'Inter', system-ui, sans-serif;
```

All typographic rules below reference these tokens — no raw font stacks inline in components.

### 2. Restyled components (CSS only — no structural edits)

All nine components below are modified **only by replacing / augmenting their scoped CSS**. Markup, props, VT names, and component boundaries stay identical.

- **`PostHero.svelte`** — title in Fraunces display (`opsz 144, wght 600, SOFT 60, WONK 1`, ~42px clamped, negative tracking); deck in Fraunces italic (`opsz 36, SOFT 100, WONK 1`). Existing 16/7 cover + gradient overlay + bottom alignment preserved. `sp-cover/title/excerpt-{slug}` VT names preserved.
- **`PostMeta.svelte`** — small-caps Inter 11px, 0.08em tracking, avatar circle left, `·` separators, "Filed under {category}" suffix, top/bottom hairline rules.
- **`ReadingProgress.svelte`** — retint progress fill to `--sp-accent` (`#fb923c`), keep 2px height.
- **`Sidebar.svelte`** — brand wordmark uses Fraunces italic (`opsz 144, wght 700, SOFT 80, WONK 1`) in accent colour; everything else (nav, author block) restyled to Inter small-caps labels.
- **`AuthorCard.svelte`** — card bg `#1b1410`, hairline border, Fraunces display name (18px, `opsz 48, SOFT 70`), Inter bio, small-caps socials row.
- **`TableOfContents.svelte`** — small-caps "On this page" label, Inter 12px list, active item in accent. Gains a new sticky child `SideRail`.
- **`SideRail.svelte`** *(new, inside TOC aside)* — `writing-mode: vertical-rl; transform: rotate(180deg);` text "Issue · {blogTitle} · {category}". Sticky top.
- **`.sp-post-content` body styles** *(in `GlobalLayout.svelte` global block, next to the existing `:global(code)` / `:global(a)` rules)* — Fraunces body (`opsz 14, wght 400, SOFT 30, WONK 0`, 17–19px, line-height 1.62). `h2`/`h3` in Fraunces display sizes. Drop cap on first `<p>`. `<hr>` styled as § glyph divider. `<blockquote.pull>` as side-hang pull quote (border-left 3px accent, Fraunces italic `opsz 60, SOFT 90, WONK 1`, 22px). `<figure>` with margin-top, `<figcaption>` with `Fig. NN ·` pseudo prefix.

### 3. Markdown pipeline extensions (two small additions)

The theme-blog already ships its own unified processor in `packages/theme-blog/src/parse-post.ts`:

```
remarkParse → remarkGfm → remarkCodeBlocks → remarkRehype → rehypeHeadingIds → rehypeStringify
```

Two new plugin files are added next to the existing `remark-code-blocks.ts`:

- **`remark-pull-quote.ts`** — a container-directive transform. Syntax `:::pull …body… :::`. Output MDAST: a `blockquote` node with `hProperties: { className: ['pull'] }`. Registered in `parse-post.ts`. Requires `remark-directive` upstream to produce the directive nodes — add `remark-directive` as a new dep and insert it in the chain immediately after `remarkGfm`, and add `remark-pull-quote` right after it.
- **`rehype-figure.ts`** — walks the HAST tree, finds paragraph nodes whose only child is an `<img alt="…">`, rewrites the paragraph to `<figure><img …/><figcaption>{alt}</figcaption></figure>`. Registered in `parse-post.ts` between `remarkRehype` and `rehypeHeadingIds`. Per-post figure numbering is handled in CSS via a counter (`counter-reset: figure` on `.sp-post-content`, `counter-increment: figure` on `figure`, `content: "Fig. " counter(figure, decimal-leading-zero) " · "` on `figcaption::before`) — no runtime numbering.

Both extensions are additive: posts that don't use them render unchanged.

### 4. What is **not** in this spec

- No new layout grids, columns, breakpoints, or containers.
- No changes to card components (`PostCardFeatured/Large/Small`), `MasonryGrid`, `Timeline`, `Taxonomy*`, `Pagination`, `SearchModal`. The editorial treatment is a **post-page signature**, not a whole-theme restyle. Cards inherit only the new Inter/Fraunces tokens.
- No JS for figure numbering (pure CSS counter).
- No custom icon system — `§` is a real Fraunces glyph.

## Data flow

No new data. Everything flows from existing sources:

- `post.title / excerpt / cover / slug / category / date / readingTime` — already on the post payload.
- `blogTitle` — already in theme config, consumed by Sidebar and now also SideRail.
- `author.name / avatar / bio / socials` — already consumed by Sidebar and AuthorCard.
- Pull quote / figure content — authored inline in markdown.

## Error handling

- **Font not loaded:** Fraunces + Inter are self-hosted via `@fontsource-variable/*` with `font-display: swap`. Fallback stacks (`Georgia` / `system-ui`) keep layout stable during the swap.
- **Post with no cover image:** `PostHero` already handles this (gradient-only hero). Unchanged.
- **Post with no excerpt:** deck element is conditionally rendered today. Unchanged.
- **Markdown without `:::pull` or images:** both extensions no-op on absence.
- **Browsers without variable-font axis support:** `font-variation-settings` degrades — we still get serif glyphs at the base weight. Acceptable.
- **Browsers without VT API:** already handled by current PostHero (progressive enhancement). Unchanged.

## Testing

- **`packages/theme-blog/__tests__/remark-pull-quote.test.ts`** — snapshot: `:::pull Quote :::` → `<blockquote class="pull">Quote</blockquote>`.
- **`packages/theme-blog/__tests__/rehype-figure.test.ts`** — snapshot: `![caption](img.png)` (paragraph-only) → `<figure><img …><figcaption>caption</figcaption></figure>`.
- **Visual check:** extend `example-blog` with one post that exercises every treatment — drop cap, `<hr>`, `:::pull`, `![…](…)` figure. Run `pnpm dev`, visually verify on that post.
- **VT regression check:** from the home grid, click into the exercised post; confirm cover/title/excerpt morph unchanged.

## Non-goals

- Light-mode editorial styling (dark-mode Ember is the brand; light mode remains the base theme's plain serif).
- Custom ligatures, OpenType feature settings beyond what Fraunces gives by default.
- Author-configurable typography tokens. The editorial personality is deliberately opinionated.
