---
title: সার্চ
---

SveltePress default theme-এ কোনো অতিরিক্ত কনফিগারেশন ছাড়াই [Pagefind](https://pagefind.app/)-এর ওপর ভিত্তি করে অন্তর্নির্মিত **লোকাল সার্চ** সুবিধা রয়েছে। এছাড়া, Default theme `docsearch` দিয়ে **Algolia DocSearch** এবং `search` দিয়ে custom search component সমর্থন করে, যার মধ্যে `@sveltepress/meilisearch`-ও আছে।

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

:::note[Production build]
কাস্টম `search` source path এখন static production build-এ bundle হয়: theme build-এর সময় নির্দিষ্ট `.svelte` path-টি resolve করে lazy chunk হিসেবে লোড করে, তাই আলাদা runtime configuration দরকার হয় না। উপরের মতো source path দিয়ে wrapper কনফিগার করুন। সরাসরি component object দেওয়া সমর্থিত নয় — theme options client-এ JSON-এ serialized হয়, তাই object বাদ পড়ে যায়। Production deployment-এ কাস্টম সার্চ না দেখালে নিশ্চিত করুন `search`-এ source-path string দেওয়া আছে।
:::

অন্য search provider-এর জন্য একই `search` hook-এ নিজস্ব Svelte wrapper দিন। অগ্রাধিকার ক্রম: custom `search` component > explicit `docsearch` > default `LocalSearch`।

## বহুভাষিক ও সংস্করণ-ভিত্তিক সাইটে সার্চ

যখন আপনার সাইটে i18n লোকেল এবং version management একসাথে থাকে, সার্চ লোকেল ও সংস্করণ অনুযায়ী আলাদা থাকে এবং crawler-এর জন্য তৈরি আউটপুটও সাইটের প্রকৃত URL কাঠামো অনুসরণ করে (`/`, `/zh/`, `/bn/`, `/v/<id>/…`, `/zh/v/<id>/…`)।

### লোকেল অনুযায়ী সার্চ

প্রতিটি লোকেলের নিজস্ব theme options থাকে, তাই প্রতিটি লোকেলের জন্য আলাদা DocSearch index দেওয়া যায় — i18n-এর আগের documentation site-এ প্রতি ভাষায় একটি index ছিল:

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // Site-level options যা সব লোকেল ভাগ করে (logo, github, pwa, ...)
      }),
      locales: {
        '/': {
          lang: 'en',
          label: 'English',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'sveltepress',
            },
          },
        },
        '/zh/': {
          lang: 'zh',
          label: '中文',
          theme: {
            docsearch: {
              appId: 'YOUR_APP_ID',
              apiKey: 'YOUR_SEARCH_API_KEY',
              indexName: 'cn',
            },
          },
        },
      },
    }),
  ],
})
```

Navbar সক্রিয় index বা version বদলালে DocSearch widget নতুন করে তৈরি করে, তাই লোকেল বা version পরিবর্তন করলে সঠিক index-এ সার্চ হয়।

### সংস্করণ অনুযায়ী সার্চ

Manifest-এর প্রতিটি version-এ `search` metadata থাকতে পারে। পাঠক কোনো historical version-এর পৃষ্ঠায় (`/v/<id>/…`) থাকলে theme DocSearch-কে নির্দিষ্ট `indexName`-এ স্যুইচ করে এবং query-তে `facetFilters` যোগ করে:

```json title="sveltepress.versions.json"
{
  "versions": [
    {
      "id": "2026-08-28",
      "search": {
        "indexName": "sveltepress-v2026-08-28",
        "facetFilters": ["version:2026-08-28"]
      }
    }
  ]
}
```

Crawler-এর facet ট্যাগগুলো এই metadata-এর সঙ্গে সামঞ্জস্য রাখুন। `search` কনফিগার না থাকা historical version-এ দেখায় "Search is not available for this documentation version." — DocSearch, custom search এবং বিল্ট-ইন লোকাল সার্চ—সব ক্ষেত্রেই একই।

### Crawling এবং result URL

তৈরি হওয়া `sitemap.xml` প্রতিটি লোকেলের বর্তমান পৃষ্ঠা এবং প্রতিটি eligible historical version পৃষ্ঠা hreflang alternate-সহ তালিকাভুক্ত করে; EOL history ডিফল্টভাবে বাদ থাকে (যদি না version `noIndex: false` দেয়), এবং প্রতিটি version পৃষ্ঠা নিজস্ব `rel="canonical"` link দেয়। Index record-গুলোকে অবশ্যই প্রকৃত prefixed URL-এ নির্দেশ করতে হবে — চীনা record-এর `url` হবে `/zh/guide/…`, আর সংস্করণ-ফ্রোজেন পৃষ্ঠার `/v/2026-08-28/guide/…`।

### Custom search component

Navbar তখনই custom `search` component রেন্ডার করে যখন বর্তমান রুটে সার্চ উপলব্ধ থাকে, version বদলালে এটি নতুন করে তৈরি হয় এবং দুটি prop পাঠায়:

- `version` — সক্রিয় version অবজেক্ট (`{ id, label, status, … }`), অথবা unprefixed পৃষ্ঠায় current version।
- `versionSearch` — ঐ version-এর `search` metadata (`{ indexName?, facetFilters? }`), না থাকলে `null`।

আপনার index-এ একাধিক version থাকলে `versionSearch`-এর facets অনুযায়ী ফলাফল ফিল্টার করুন। Record URL অবশ্যই সম্পূর্ণ prefixed রুট হতে হবে। Framework কোনো locale prop পাঠায় না: প্রতি ভাষায় আলাদা index রাখলে `location.pathname` থেকে নিজেই লোকেল পড়ুন।
