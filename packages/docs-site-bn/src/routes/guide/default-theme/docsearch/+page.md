---
title: Docsearch
---

ন্যাভবারে [Docsearch](https://docsearch.algolia.com/) যুক্ত করতে থিম ডিফল্টে `docsearch` পাঠিয়ে দিন। 

`docsearch` এর মেইন প্রপস হচ্ছে এগুলো: `appId`, `apiKey`,`indexName`

সকল অপশন [এখানে](https://docsearch.algolia.com/docs/api) পাওয়া যাবে 

Docsearch সব প্রোভাইড করছে।  

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

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