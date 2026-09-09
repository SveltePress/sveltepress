---
title: Blog theme
versionChanges:
  exclude: true
---

The `@sveltepress/theme-blog` package provides a content-centered, responsive blog theme for SveltePress with built-in post listing, pagination, tags, categories, reading time, RSS feed generation, and Giscus comments.

## Installation

```sh
pnpm add -D @sveltepress/theme-blog
```

## Vite Configuration

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        author: {
          name: 'Jane Doe',
          avatar: '/avatar.png',
          bio: 'Writing about web development.',
        },
        pageSize: 10,
      }),
    }),
  ],
})
```

## Theme Options

* `author`: `AuthorProfile | string` - Author details including `name`, `avatar`, `bio`, and `socials`.
* `logo`: `string` - Path to the blog logo in `static/`.
* `footer`: `string` - Custom footer text or markdown.
* `postsDir`: `string` - Markdown posts directory (defaults to `'src/routes/posts'`).
* `pageSize`: `number` - Number of posts per pagination page (default: `10`).
* `themeColor`: `ThemeColor` - Colors for `primary`, `secondary`, `bg`, and `surface`.
* `giscus`: `GiscusConfig` - Giscus comment system integration (`repo`, `repoId`, `category`, `categoryId`).
* `socials`: `AuthorSocials` - Links for GitHub, Twitter/X, Mastodon, Bluesky, RSS, and email.
* `pwa`: `SvelteKitPWAOptions` - PWA service worker options.
* `highlighter`: Shiki code highlighter configuration.

## Virtual Modules

The blog theme Vite plugin provides several virtual modules for querying blog content:

| Module | Exports / Type | Description |
| --- | --- | --- |
| `virtual:sveltepress/blog-config` | `blogConfig: BlogThemeOptions` | The resolved blog configuration passed to `blogTheme()`. |
| `virtual:sveltepress/blog-posts-meta` | `posts: BlogPostMeta[]` | Lightweight metadata array for all published blog posts. |
| `virtual:sveltepress/blog-post/<slug>` | `default: BlogPost` | Full post record with pre-rendered HTML content. |
| `virtual:sveltepress/blog-tags-index` | `tags: Array<{ name, count }>` | List of all tags and their post counts. |
| `virtual:sveltepress/blog-tag/<tag>` | `default: BlogPostMeta[]` | Posts matching a specific tag. |
| `virtual:sveltepress/blog-categories-index` | `categories: Array<{ name, count }>` | List of all categories and their post counts. |
| `virtual:sveltepress/blog-category/<cat>` | `default: BlogPostMeta[]` | Posts matching a specific category. |
| `virtual:sveltepress/blog-runtime` | `postsJsonDir, tagsJsonDir, categoriesJsonDir` | Absolute disk cache paths for server load functions. **Server only**. |

## Public Components

You can import and customize the theme's built-in Svelte components:

* `@sveltepress/theme-blog/AuthorCard.svelte` - Compact author banner.
* `@sveltepress/theme-blog/AuthorProfile.svelte` - Full author profile with social links.
* `@sveltepress/theme-blog/PostMeta.svelte` - Post date, reading time, author, and tags bar.
* `@sveltepress/theme-blog/GiscusComments.svelte` - Embedded Giscus comments container.
* `@sveltepress/theme-blog/GlobalLayout.svelte` - Global layout wrapper.
* `@sveltepress/theme-blog/PostLayout.svelte` - Individual post layout wrapper.
