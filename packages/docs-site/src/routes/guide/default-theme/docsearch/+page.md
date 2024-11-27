---
title: Docsearch
---

Pass `docsearch` to theme default to add a [Docsearch](https://docsearch.algolia.com/) on navbar

`docsearch` contain these main props: `appId`, `apiKey`,`indexName`

Complete options can be found [here](https://docsearch.algolia.com/docs/api)

All provided by Docsearch.

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        docsearch: {
          appId: 'XXX',
          apiKey: 'XXX',
          indexName: 'XXX',
        }
      })
    })
  ]
})
```
