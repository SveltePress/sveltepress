---
title: Docsearch
---

Pass `docsearch` to theme default to add a [Docsearch](https://docsearch.algolia.com/) on navbar

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        docsearch: {
          apiKey: 'XXX',
          appId: 'XXX',
          indexName: 'XXX',
        }
      })
    })
  ]
})
```