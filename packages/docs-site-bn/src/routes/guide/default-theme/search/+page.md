---
title: সার্চ
---

Production site-এর জন্য default theme বর্তমানে built-in `docsearch` option-এর মাধ্যমে কেবল **Algolia DocSearch** সমর্থন করে।

## Algolia DocSearch

Navbar-এ [Algolia DocSearch](https://docsearch.algolia.com/) সক্রিয় করতে `defaultTheme`-এ `docsearch` config object দিন।

`appId`, `apiKey` এবং `indexName` আবশ্যিক। অন্য সব [DocSearch option](https://docsearch.algolia.com/docs/api)-ও ব্যবহার করা যায়।

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

:::note[DocSearch-এর জন্য আবেদন]
Open-source documentation site-এর জন্য DocSearch বিনামূল্যে পাওয়া যায়। [docsearch.algolia.com](https://docsearch.algolia.com/apply/)-এ আবেদন করুন।
:::

## Custom search ও Meilisearch-এর বর্তমান অবস্থা

Public type-এ এখনও `search?: Component | string` আছে এবং repository-তে `@sveltepress/meilisearch` component-ও রয়েছে। তবে production-এ `defaultTheme({ search })` দিয়ে এগুলো এখন ব্যবহার করবেন না:

- theme option serialize করার সময় component object বাদ যায়;
- string path browser runtime-এ import হয়, তাই local `/src/...` module production bundle-এ থাকে না।

Runtime integration নতুনভাবে তৈরি না হওয়া পর্যন্ত `docsearch` ব্যবহার করুন, অথবা default theme-এর `search` option-এর বাইরে search implement করুন। Option-টি এখানে রাখা হয়েছে বর্তমান সীমাবদ্ধতা স্পষ্ট করার জন্য; এটি কার্যকর production contract নয়।
