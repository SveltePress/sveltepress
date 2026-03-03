---
title: Search
---

Sveltepress default theme supports three ways to add search to your site:

- **Algolia DocSearch** — via the built-in `docsearch` option
- **Meilisearch** — via `@sveltepress/meilisearch` and the `search` option
- **Custom search** — pass any Svelte component or a module path string to the `search` option

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

[Meilisearch](https://www.meilisearch.com/) is an open-source, self-hosted search engine. Use the `@sveltepress/meilisearch` package together with the `search` option to add it to your site.

### Installation

@install-pkg(@sveltepress/meilisearch)

### Configuration

Pass the path to the `Search.svelte` component exported by `@sveltepress/meilisearch` to the `search` option:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: '@sveltepress/meilisearch/Search.svelte',
      }),
    }),
  ],
})
```

The `Search.svelte` component accepts the following props. You can pass them by creating a thin wrapper component around the imported `Search.svelte` and providing them as props.

| Prop | Type | Required | Description |
|---|---|---|---|
| `host` | `string` | ✅ | URL of your Meilisearch instance |
| `apiKey` | `string` | ✅ | Search-only API key |
| `indexName` | `string` | ✅ | Index name to search |
| `placeholder` | `string` | — | Placeholder text for the search input (default: `'Search...'`) |
| `limit` | `number` | — | Maximum number of results to show (default: `10`) |

:::tip[Self-hosted vs Meilisearch Cloud]
You can host Meilisearch yourself or use [Meilisearch Cloud](https://cloud.meilisearch.com/). The `host` URL points to whichever deployment you choose.
:::

## Custom Search

The `search` option also accepts a Svelte `Component` directly, which lets you use any search library you like:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import MySearchComponent from './src/components/MySearchComponent.svelte'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        search: MySearchComponent,
      }),
    }),
  ],
})
```

:::note[search vs docsearch priority]
When both `search` and `docsearch` are provided, `search` takes priority and `docsearch` is ignored.
:::
