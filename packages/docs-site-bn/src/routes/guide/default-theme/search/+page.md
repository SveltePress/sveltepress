---
title: সার্চ
---

Default theme `docsearch` দিয়ে **Algolia DocSearch** এবং `search` দিয়ে custom search component সমর্থন করে, যার মধ্যে `@sveltepress/meilisearch`-ও আছে।

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

## Meilisearch

`@sveltepress/meilisearch` হলো supported Meilisearch search component। প্রথমে package-টি install করুন:

@install-pkg(@sveltepress/meilisearch)

Meilisearch connection setting দেওয়ার জন্য একটি wrapper component তৈরি করুন:

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

তারপর default theme-এর custom-search hook-এ wrapper path দিন:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  search: '/src/lib/MeilisearchSearch.svelte',
})
```

Component-টি আগে থেকে তৈরি Meilisearch index query করে; এটি index তৈরি করে না। প্রতিটি record-এ `id`, `title`, `content`, এবং `url` অথবা `path` থাকা উচিত। Browser code-এ search-only API key ব্যবহার করুন।

:::warning[Known production build bug]
Custom-search API এবং `@sveltepress/meilisearch` component supported, এবং উপরের source-path setup development-এ কাজ করে। তবে বর্তমান default-theme runtime `.svelte` path-টিকে browser import হিসেবে রেখে দেয়, তাই static production build wrapper-টি bundle করে না। সরাসরি component object দিলেও theme-option serialization সেটি বাদ দেয়। এটি default-theme bundling-এর production build bug, M Search support না থাকার প্রমাণ নয়। Runtime integration fix না হওয়া পর্যন্ত production deployment যাচাই করুন।
:::

অন্য search provider-এর জন্য একই `search` hook-এ নিজস্ব Svelte wrapper দিন। `search` ও `docsearch` দুটোই configure করলে `search` অগ্রাধিকার পায়।
