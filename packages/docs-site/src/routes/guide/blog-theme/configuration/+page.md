---
title: Configuration
---

All options are passed to `blogTheme()` in `vite.config.ts`.

## `BlogThemeOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Site title. Used in `<title>`, sidebar brand, OG tags, RSS feed. |
| `description` | `string` | — | Site description. Used for meta + OG. |
| `base` | `string` | — | Fully-qualified site URL (e.g. `https://example.com`). Used to produce absolute RSS links and OG image URLs. |
| `author` | [`AuthorProfile`](#authorprofile) | — | Author identity shown in the sidebar. |
| `about` | `{ html: string }` | — | Raw HTML block rendered below author info in the sidebar (keep it short — About no longer has a standalone page). |
| `navbar` | `Array<{ title, to }>` | — | Nav links rendered below author info. `to` values are automatically prefixed with SvelteKit's `base`. |
| `themeColor` | [`ThemeColor`](#themecolor) | Ember palette | Dark-mode palette override. |
| `themeColorLight` | [`ThemeColor`](#themecolor) | warm cream | Light-mode palette override. |
| `defaultMode` | `'system' \| 'dark' \| 'light'` | `'system'` | Initial colour mode before user toggles. |
| `postsDir` | `string` | `'src/posts'` | Directory scanned for `*.md` posts. |
| `pageSize` | `number` | `12` | Posts per page on the home listing. |
| `highlighter` | [`HighlighterOptions`](#highlighteroptions) | — | Shiki/Twoslash options. |
| `rss` | `{ enabled, limit, copyright }` | enabled, 20 | RSS feed generation. Writes to `static/rss.xml`. |
| `ogImage` | `{ enabled, fontPath, tagline }` | enabled | Per-post OG image generation via Satori. |
| `giscus` | [`GiscusConfig`](#giscusconfig) | — | Set to enable GitHub-discussions-backed comments. |

## `AuthorProfile`

```ts
interface AuthorProfile {
  name: string
  avatar?: string    // absolute URL or /-prefixed static/ path
  bio?: string
  socials?: {
    github?: string    // username, not URL
    twitter?: string   // username, not URL
    mastodon?: string  // full profile URL
    bluesky?: string   // handle like 'name.bsky.social'
    email?: string
    website?: string   // full URL
    rss?: string       // full URL or /-prefixed path
  }
}
```

## `ThemeColor`

```ts
interface ThemeColor {
  primary?: string   // default '#fb923c'
  secondary?: string // default '#dc2626'
  bg?: string        // default '#1a0a00'
  surface?: string   // default '#2d1200'
}
```

## `HighlighterOptions`

```ts
interface HighlighterOptions {
  themeDark?: string   // Shiki theme, default 'night-owl'
  themeLight?: string  // Shiki theme, default 'vitesse-light'
  languages?: string[] // extra languages merged with defaults
  twoslash?: boolean   // enable Twoslash TypeScript hover info
}
```

## `GiscusConfig`

```ts
interface GiscusConfig {
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  reactionsEnabled?: boolean
  inputPosition?: 'top' | 'bottom'
  lang?: string
}
```

Fill in these values from [giscus.app](https://giscus.app/). A `GiscusComments` component is rendered below each post automatically when `giscus` is set. Theme switching (light/dark) is wired through automatically.

## Environment variables

The example site reads two env vars at build time:

| Var | Effect |
|---|---|
| `BASE_PATH` | SvelteKit `paths.base`. Set when deploying under a subpath. |
| `SITE_URL` | Overrides `blogTheme()` `base`. Used for OG/RSS absolute URLs. |

The theme itself doesn't read these — they're wired by your `svelte.config.js` and `vite.config.ts`.
