---
title: সার্চ
---

SveltePress default theme-এ কোনো অতিরিক্ত কনফিগারেশন ছাড়াই [Pagefind](https://pagefind.app/)-এর ওপর ভিত্তি করে অন্তর্নির্মিত **লোকাল সার্চ** সুবিধা রয়েছে, পাশাপাশি `docsearch` দিয়ে **Algolia DocSearch** এবং `search` দিয়ে কাস্টম সার্চ উপাদান ব্যবহারের সম্পূর্ণ সমর্থনও বজায় রাখা হয়েছে।

## লোকাল সার্চ (ডিফল্ট)

লোকাল সার্চ কোনো কনফিগারেশন ছাড়াই ডিফল্টভাবে সক্রিয় থাকে। আপনার ডকুমেন্টেশন সাইট বিল্ড করার সময় (`pnpm build`), SveltePress স্বয়ংক্রিয়ভাবে Pagefind চালিয়ে সমস্ত স্ট্যাটিক HTML পেজ ইনডেক্স করে এবং সার্চ অ্যাসেটগুলো `/pagefind/` ডিরেক্টরিতে বান্ডেল করে।

### প্রধান বৈশিষ্ট্য

- **জিরো-কনফিগ**: কোনো এক্সটার্নাল API Key বা দূরবর্তী ইনডেক্সিং পরিষেবা ছাড়াই তাৎক্ষণিকভাবে কাজ করে।
- **অফলাইন এবং স্ট্যাটিক**: ব্রাউজারে সম্পূর্ণ WebAssembly-এর মাধ্যমে চলে, যা অত্যন্ত দ্রুত ও গোপনীয়তাবান্ধব।
- **বহুভাষিক ফিল্টারিং**: স্বয়ংক্রিয়ভাবে `<html lang="...">` শনাক্ত করে এবং বর্তমান পৃষ্ঠার ভাষায় সার্চ সীমাবদ্ধ রাখে।
- **কিবোর্ড শর্টকাট**: `Cmd+K` (macOS) বা `Ctrl+K` (Windows/Linux) দিয়ে খোলে, তীরচিহ্ন দিয়ে নির্বাচন করা যায়, Enter দিয়ে পৃষ্ঠায় যাওয়া যায়, Escape দিয়ে বন্ধ হয়।
- **ডেভেলপমেন্ট নোটিশ**: ডেভেলপমেন্ট মোডে (`pnpm dev`) সার্চ করলে স্পষ্ট নোটিশ দেখায় যে প্রোডাকশন বিল্ডের সময় সম্পূর্ণ ইনডেক্স তৈরি হয়।

### লোকাল সার্চ নিষ্ক্রিয় করা

আপনি যদি অনুসন্ধান সম্পূর্ণরূপে নিষ্ক্রিয় করতে চান:

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

আপনি Vite প্লাগইনে বিল্ড-টাইম ইনডেক্সার নিষ্ক্রিয় করতে পারেন:

```ts title="vite.config.(js|ts)"
import { sveltepress } from '@sveltepress/vite'

sveltepress({
  pagefind: false,
})
```

## Algolia DocSearch

ডিফল্ট লোকাল সার্চের পরিবর্তে [Algolia DocSearch](https://docsearch.algolia.com/) ব্যবহার করতে `defaultTheme`-এ `docsearch` কনফিগ অবজেক্ট দিন।

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

অন্য search provider-এর জন্য একই `search` hook-এ নিজস্ব Svelte wrapper দিন। অগ্রাধিকার ক্রম: custom `search` component > explicit `docsearch` > default `LocalSearch`।
