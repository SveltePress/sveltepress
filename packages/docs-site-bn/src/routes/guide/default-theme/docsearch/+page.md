---
title: Docsearch
---

ন্যাভবারে [Docsearch](https://docsearch.algolia.com/) যুক্ত করতে থিম ডিফল্টে `docsearch` পাঠিয়ে দিন।

`docsearch` এর মেইন প্রপস হচ্ছে এগুলো: `appId`, `apiKey`,`indexName`

সকল অপশন [এখানে](https://docsearch.algolia.com/docs/api) পাওয়া যাবে

Docsearch সব প্রোভাইড করছে।

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
