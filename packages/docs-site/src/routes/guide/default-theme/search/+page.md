---
title: Search
---

For production sites, the default theme currently supports **Algolia DocSearch** through the built-in `docsearch` option.

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

## Custom search and Meilisearch status

The public type still exposes `search?: Component | string`, and the repository contains an `@sveltepress/meilisearch` component. Do not use either through `defaultTheme({ search })` in production yet:

- component objects are removed when theme options are serialized;
- string paths are imported by the browser at runtime and local `/src/...` modules are not included in the production bundle.

Until the runtime integration is redesigned, use `docsearch` or implement search outside the default theme's `search` option. The option remains documented so its current limitation is explicit; it is not a working production contract.
