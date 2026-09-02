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

:::warning[Known production build bug]
The custom-search API and `@sveltepress/meilisearch` component are supported, and the source-path setup above works in development. However, the current default-theme runtime leaves the `.svelte` path as a browser import, so a static production build does not bundle that wrapper. Passing a component object directly is also ineffective because theme-option serialization removes it. This is a default-theme bundling bug, not a lack of M Search support. Verify the production deployment until the runtime integration is fixed.
:::

For another search provider, implement the same `search` hook with your own Svelte wrapper. Search precedence is: custom `search` component > explicit `docsearch` > default `LocalSearch`.
