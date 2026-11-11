---
title: Writing posts
---

Posts live in `src/posts/` (configurable via `postsDir`). Each post is a single `.md` file. The filename (minus `.md`) becomes the slug and the URL path under `/posts/`.

## Frontmatter

```md title="src/posts/my-post.md"
---
title: A new beginning
date: 2026-04-17
author: Dongsheng
tags: [svelte, web]
category: engineering
excerpt: A short one-liner shown in cards and RSS.
cover: /covers/new-beginning.jpg
draft: false
---

Write markdown below the frontmatter.
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Shown in the post hero and list cards. |
| `date` | string | yes | ISO date (`YYYY-MM-DD`). Drives sort order and timeline grouping. |
| `excerpt` | string | recommended | Short description. Used in cards, RSS, OG. If omitted, the theme derives one from the body. |
| `tags` | string[] | — | Rendered as pill links below the post title. Each tag gets a `/tags/<name>/` page. |
| `category` | string | — | At most one per post. Gets a `/categories/<name>/` page. |
| `author` | string | — | Overrides the site-wide `author.name` for this post. |
| `cover` | string | — | Path or URL to a cover image. If set, the post renders with `PostCardLarge`; if not, the theme picks a tag-hashed gradient. |
| `draft` | boolean | — | Drafts are excluded from generated routes, listings, RSS, OG images, and the timeline. |

## Images and links

Put site-owned images in `static/` and reference them with site-absolute paths such as `/covers/new-beginning.jpg`. The theme prefixes site-absolute cover paths, Markdown image sources, and links in post bodies with SvelteKit's configured base path, so the same post works at the site root and under a subpath such as GitHub Pages. Fully qualified, protocol-relative, fragment, mail, and relative URLs remain unchanged.

Readers can click an image to [zoom it full screen](../features/#Image-zoom). To keep an image from zooming, wrap it in an element with `data-no-zoom`, leaving blank lines around the image:

```md
<div data-no-zoom>

![Team photo](/photos/team.jpg)

</div>
```

## Math

Formulas are written in TeX and rendered with KaTeX at build time. Wrap inline math in `$…$` and display math in `$$…$$`:

````md
Binary search runs in $O(\log n)$ time.

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
````

A line that holds nothing but `$$…$$` also becomes a centred display block, even when it directly follows a line of text. `$$…$$` that shares its line with other text stays inline.

## Code tabs

Group several blocks under one set of tabs with a `::::code-tabs` container. Every heading at the level of the first heading inside it starts a tab, and the heading text is the tab label:

````md
::::code-tabs{active="pnpm"}
### npm
```sh
npm install -D @sveltepress/theme-blog
```
### pnpm
```sh
pnpm add -D @sveltepress/theme-blog
```
::::
````

A panel holds whatever follows its heading: usually one code block, but text, images or a nested `code-tabs` work too. The tabs can be collapsed, and have a copy button.

| Attribute | Effect |
|---|---|
| `active` | Label of the tab shown first. Defaults to the first tab. |
| `vertical` | Stacks the tab buttons in the top-right corner of the code, and panels slide up and down when switching. |
| `hide-copy` | Removes the copy button. |

## Live code

Add `live` to a ` ```svelte ` block to render the component above its source:

````md
```svelte live
<script>
  let count = $state(0)
</script>

<button onclick={() => count++}>Clicked {count} times</button>
```
````

Add `collapsed` to start with the source hidden. Any other meta, such as `title="…"` or line highlighting, applies to the source block. The label of the show/hide toggle is set with [`liveCode.sourceLabel`](../configuration/#BlogThemeOptions).

Each block is compiled as its own component with your project's Svelte config, and a post only loads the blocks it uses.

## Demo components

Any `.svelte` file in `src/demos/` (configurable via `demosDir`) can be used in a post as a tag with the file name:

```svelte title="src/demos/Badge.svelte"
<script>
  let { text, tone = 'info' } = $props()
</script>

<span class="badge badge--{tone}">{text}</span>
```

```md title="src/posts/my-post.md"
The build is <Badge text="passing" tone="success" /> again.

<Badge text="On its own line" />
```

Attributes become props: `text="x"` passes `text: 'x'`, `package-name="y"` passes `packageName: 'y'`, and a bare attribute such as `dev` passes `dev: true`. All values are strings. A tag on its own line is mounted as a block; a tag inside a paragraph, heading or table cell is mounted inline.

Only names that match a file in the demos directory are treated as components; other tags stay plain HTML. Adding or removing a demo file in dev rebuilds the posts.

## Listings

- The home page (`/`) shows posts in a masonry grid with the newest post featured.
- `/timeline/` shows all non-draft posts grouped by month.
- `/tags/` shows all tags with their counts.
- `/categories/<name>/` and `/tags/<name>/` show posts filtered by that taxonomy.

## Excerpts

If you don't provide an `excerpt`, the theme derives one from the first paragraph of the body. For cleaner control, always set `excerpt` explicitly — especially for posts that open with an image or code block.

## Reading time

Reading time is computed automatically from word count and shown in post cards, the timeline, and the post meta strip. Words are counted on the rendered HTML.

## Drafts

Set `draft: true` in frontmatter to exclude a post from the generated site. Drafts are not written to the public post index and their `/posts/<slug>/` route is not prerendered, so direct links return 404 in a production build.

Flip `draft: false` when you're ready to publish.

## Related posts

Each post page shows up to a few related posts at the bottom. Relatedness is scored by shared tags, shared category, and year proximity — no config needed.
