---
title: Search
---

The default theme supports **Algolia DocSearch** through `docsearch` and custom search components through `search`, including `@sveltepress/meilisearch`.

## Algolia DocSearch

Pass a `docsearch` config object to `defaultTheme` to enable [Algolia DocSearch](https://docsearch.algolia.com/) in the navbar.

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

For another search provider, implement the same `search` hook with your own Svelte wrapper. If both `search` and `docsearch` are configured, `search` takes precedence.
