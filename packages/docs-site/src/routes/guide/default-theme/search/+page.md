---
title: Search
---

SveltePress default theme provides built-in **Local Search** powered by [Pagefind](https://pagefind.app/) out of the box with zero configuration. In addition, the default theme supports **Algolia DocSearch** through `docsearch` and custom search components through `search`, including `@sveltepress/meilisearch`.

## Local Search (Default)

Local search is enabled by default with zero configuration. When building your documentation site (`pnpm build`), SveltePress automatically runs Pagefind to index all static HTML pages and bundles the search assets into `/pagefind/`.

### Features

- **Zero-config**: Works immediately without external API keys or remote indexing services.
- **Offline & Static**: Runs entirely in the browser via WebAssembly, fast and privacy-friendly.
- **Multi-locale support**: Automatically detects `<html lang="...">` and filters search queries by the active page language.
- **Keyboard navigation**: Opens via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux), navigate with Arrow keys, select with Enter, close with Escape.
- **Development notice**: In development mode (`pnpm dev`), searching displays an informative notice explaining that the full index is created during production build.

### Disabling Local Search

If you want to disable search entirely:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: false,
      }),
    }),
  ],
})
```

You can also disable the build-time indexer in the Vite plugin:

```ts title="vite.config.(js|ts)"
import { sveltepress } from '@sveltepress/vite'

sveltepress({
  pagefind: false,
})
```

## Algolia DocSearch

Pass a `docsearch` config object to `defaultTheme` to use [Algolia DocSearch](https://docsearch.algolia.com/) instead of the default local search in the navbar.

Required fields are `appId`, `apiKey`, and `indexName`. Every other [DocSearch option](https://docsearch.algolia.com/docs/api) is also accepted.

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        docsearch: {
          appId: 'YOUR_APP_ID',
          apiKey: 'YOUR_SEARCH_API_KEY',
          indexName: 'YOUR_INDEX_NAME',
        },
      }),
    }),
  ],
})
```

:::note[Apply for DocSearch]
DocSearch is free for open-source documentation sites. Apply at [docsearch.algolia.com](https://docsearch.algolia.com/apply/).
:::

## Meilisearch

`@sveltepress/meilisearch` is the supported Meilisearch search component. Install it first:

@install-pkg(@sveltepress/meilisearch)

Create a wrapper that provides your Meilisearch connection settings:

```svelte title="src/lib/MeilisearchSearch.svelte"
<script lang="ts">
  import Search from '@sveltepress/meilisearch/Search.svelte'
</script>

<Search
  host="https://search.example.com"
  apiKey="YOUR_SEARCH_ONLY_KEY"
  indexName="docs"
/>
```

Then pass the wrapper path to the default theme's custom-search hook:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  search: '/src/lib/MeilisearchSearch.svelte',
})
```

The component queries an existing Meilisearch index; it does not build the index for you. Each record should provide `id`, `title`, `content`, and either `url` or `path`. Use a search-only API key in browser code.

:::note[Production builds]
A custom `search` source path is bundled into static production builds: the theme resolves the configured `.svelte` path at build time and loads it as a lazy chunk, so no extra runtime configuration is needed. Configure the wrapper as a source path (as above). Passing a component object directly is not supported — theme options are serialized to JSON for the client, so objects are dropped. If a production deployment shows no search, make sure `search` is a source-path string.
:::

For another search provider, implement the same `search` hook with your own Svelte wrapper. Search precedence is: custom `search` component > explicit `docsearch` > default `LocalSearch`.

## Search across locales and versions

When your site combines i18n locales with version management, search stays per-locale and per-version, and the crawler-facing outputs follow the same URL scheme the site serves (`/`, `/zh/`, `/bn/`, `/v/<id>/…`, `/zh/v/<id>/…`).

### Locale-aware search

Each locale carries its own theme options, so give each locale its own DocSearch index — the pre-i18n documentation site used one index per language:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // Site-level options shared by every locale (logo, github, pwa, ...)
      }),
      locales: {
        '/': {
          lang: 'en',
          label: 'English',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'sveltepress',
            },
          },
        },
        '/zh/': {
          lang: 'zh',
          label: '中文',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'cn',
            },
          },
        },
      },
    }),
  ],
})
```

The Navbar remounts the DocSearch widget whenever the active index or version changes, so switching locale or version queries the right index.

### Version-aware search

A version in the manifest may carry `search` metadata. While a reader is on that historical version's pages (`/v/<id>/…`), the theme switches DocSearch to the configured `indexName` and merges `facetFilters` into the query:

```json title="sveltepress.versions.json"
{
  "versions": [
    {
      "id": "2026-08-28",
      "search": {
        "indexName": "sveltepress-v2026-08-28",
        "facetFilters": ["version:2026-08-28"]
      }
    }
  ]
}
```

Keep the crawler's facet tags in sync with this metadata.

:::since[Historical Local Search vs DocSearch]{version="2026-09-03" id="search-historical-pagefind-vs-docsearch" summary="Pagefind historical indexes stay available; DocSearch/custom search still need version search metadata."}
Historical versions without a `search` object show "Search is not available for this documentation version." for **DocSearch** and custom `search` components only. Built-in **Local Search** still loads the frozen Pagefind index under that version's `/pagefind/` path (via `syncHistoricalPagefind` on release) and does not require `search` metadata.
:::

### Crawling and result URLs

The generated `sitemap.xml` lists every locale's current pages and every eligible historical version page with hreflang alternates; EOL history is excluded unless the version opts out (`noIndex: false`), and every version page emits its own `rel="canonical"` link. Index records must point at these real, prefixed URLs — a Chinese record's `url` is `/zh/guide/…`, a frozen version's is `/v/2026-08-28/guide/…`.

### Custom search components

The Navbar renders a custom `search` component only when search is available for the current route, remounts it per version, and passes it two props:

- `version` — the active version object (`{ id, label, status, … }`), or the current version on unprefixed pages.
- `versionSearch` — the version's `search` metadata (`{ indexName?, facetFilters? }`), or `null`.

When your index stores multiple versions, filter results by the facets in `versionSearch`. Record URLs must be the full prefixed routes. No locale prop is passed: if you keep one index per locale, read the locale from `location.pathname` yourself.
