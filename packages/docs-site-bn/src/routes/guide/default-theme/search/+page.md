---
title: সার্চ
---

Sveltepress ডিফল্ট থিম তিনটি উপায়ে আপনার সাইটে সার্চ যুক্ত করার সুবিধা দেয়:

- **Algolia DocSearch** — বিল্ট-ইন `docsearch` অপশনের মাধ্যমে
- **Meilisearch** — `@sveltepress/meilisearch` এবং `search` অপশনের মাধ্যমে
- **কাস্টম সার্চ** — `search` অপশনে যেকোনো Svelte কম্পোনেন্ট বা মডিউল পাথ স্ট্রিং পাঠিয়ে

## Algolia DocSearch

নেভবারে [Algolia DocSearch](https://docsearch.algolia.com/) সক্রিয় করতে `defaultTheme`-এ `docsearch` কনফিগ অবজেক্ট পাঠান।

`appId`, `apiKey` এবং `indexName` আবশ্যিক। বাকি সব [DocSearch অপশনও](https://docsearch.algolia.com/docs/api) গ্রহণযোগ্য।

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
ওপেন-সোর্স ডকুমেন্টেশন সাইটের জন্য DocSearch বিনামূল্যে পাওয়া যায়। [docsearch.algolia.com](https://docsearch.algolia.com/apply/)-এ আবেদন করুন।
:::

## Meilisearch

[Meilisearch](https://www.meilisearch.com/) একটি ওপেন-সোর্স, সেলফ-হোস্টেড সার্চ ইঞ্জিন। `@sveltepress/meilisearch` প্যাকেজ এবং `search` অপশন ব্যবহার করে এটি সাইটে যুক্ত করুন।

### ইনস্টলেশন

@install-pkg(@sveltepress/meilisearch)

### কনফিগারেশন

`@sveltepress/meilisearch` থেকে এক্সপোর্ট করা `Search.svelte` কম্পোনেন্টের পাথ `search` অপশনে দিন:

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

`Search.svelte` কম্পোনেন্ট নিচের props গ্রহণ করে। একটি র‍্যাপার কম্পোনেন্ট তৈরি করে এই props পাঠানো যাবে।

| Prop | টাইপ | আবশ্যিক | বিবরণ |
|---|---|---|---|
| `host` | `string` | ✅ | আপনার Meilisearch ইন্সট্যান্সের URL |
| `apiKey` | `string` | ✅ | শুধু সার্চের জন্য API কী |
| `indexName` | `string` | ✅ | সার্চ করার ইনডেক্সের নাম |
| `placeholder` | `string` | — | সার্চ ইনপুটের প্লেসহোল্ডার টেক্সট (ডিফল্ট: `'Search...'`) |
| `limit` | `number` | — | সর্বোচ্চ ফলাফল সংখ্যা (ডিফল্ট: `10`) |

:::tip[সেলফ-হোস্টেড বনাম Meilisearch Cloud]
আপনি নিজেই Meilisearch হোস্ট করতে পারেন অথবা [Meilisearch Cloud](https://cloud.meilisearch.com/) ব্যবহার করতে পারেন। `host`-এ আপনার ডিপ্লয়মেন্টের URL দিন।
:::

## কাস্টম সার্চ

`search` অপশনে সরাসরি Svelte `Component` পাঠানো যায়, যা দিয়ে যেকোনো সার্চ লাইব্রেরি ব্যবহার করা সম্ভব:

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

:::note[search ও docsearch-এর অগ্রাধিকার]
`search` এবং `docsearch` একসাথে দেওয়া থাকলে `search`-ই কার্যকর হবে এবং `docsearch` উপেক্ষা করা হবে।
:::
