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
| `draft` | boolean | — | Drafts are built but excluded from listings, RSS, OG image generation, and the timeline. |

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

Set `draft: true` in frontmatter to keep a post off public listings. The post is still written to disk during build (so links you share pre-publish keep working if you copied them early), but it won't appear in the home grid, RSS, timeline, or OG image set.

Flip `draft: false` when you're ready to publish.

## Related posts

Each post page shows up to a few related posts at the bottom. Relatedness is scored by shared tags, shared category, and year proximity — no config needed.
