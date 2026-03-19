---
title: সাইডবার
---

## ভূমিকা

সাইডবার কনফিগার করতে ডিফল্ট থিমে `sidebar` অপশন পাস করুন। সাইডবার সেটআপ করার দুটি উপায় রয়েছে:

- **স্বয়ংক্রিয়** — আপনার রাউট ডিরেক্টরি স্ক্যান করে ফাইল স্ট্রাকচার এবং frontmatter থেকে সাইডবার তৈরি করে
- **ম্যানুয়াল** — আপনার Vite কনফিগে প্রতিটি সাইডবার আইটেম সুনির্দিষ্টভাবে সংজ্ঞায়িত করুন

## স্বয়ংক্রিয় সাইডবার

SveltePress কে আপনার `src/routes/` ডিরেক্টরি স্ক্যান করে স্বয়ংক্রিয়ভাবে সাইডবার তৈরি করতে `sidebar` কে `{ enabled: true }` সেট করুন।

```ts
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        sidebar: {
          enabled: true,
        },
      }),
    }),
  ],
})
```

SveltePress শীর্ষ-স্তরের রাউট ডিরেক্টরি (যেমন `/guide/`, `/reference/`) শনাক্ত করে স্বয়ংক্রিয়ভাবে সাইডবার গ্রুপ তৈরি করবে।

### অপশনসমূহ

| অপশন | টাইপ | ডিফল্ট | বিবরণ |
| --- | --- | --- | --- |
| `enabled` | `boolean` | — | স্বয়ংক্রিয় সাইডবার সক্রিয় করতে `true` সেট করুন |
| `routesDir` | `string` | `'src/routes'` | কাস্টম রাউট ডিরেক্টরি পাথ |
| `roots` | `string[]` | স্বয়ংক্রিয় শনাক্তকরণ | সাইডবার তৈরির জন্য রুট পাথ, যেমন `['/guide/', '/reference/']`। নির্দিষ্ট না করলে শীর্ষ-স্তরের রাউট ডিরেক্টরি থেকে স্বয়ংক্রিয়ভাবে শনাক্ত করা হয় |

```txt
sidebar: {
  enabled: true,
  routesDir: 'src/routes',
  roots: ['/guide/', '/reference/'],
}
```

### Frontmatter নিয়ন্ত্রণ

আপনার `+page.md` ফাইলে frontmatter ব্যবহার করে স্বয়ংক্রিয় সাইডবারে পেজের প্রদর্শন নিয়ন্ত্রণ করুন।

```md
---
title: শুরু করুন
order: 1
sidebar: true
sidebarTitle: এখান থেকে শুরু
collapsible: true
---
```

| ফিল্ড | টাইপ | ডিফল্ট | বিবরণ |
| --- | --- | --- | --- |
| `title` | `string` | ফাইলনাম থেকে অনুমান | পেজ শিরোনাম, সাইডবার লেবেল হিসেবেও ব্যবহৃত |
| `sidebarTitle` | `string` | — | সাইডবার লেবেল ওভাররাইড করুন (`title` এর চেয়ে অগ্রাধিকার পায়) |
| `order` | `number` | `100` | একই স্তরে সাজানোর ক্রম। ছোট সংখ্যা আগে দেখায় |
| `sidebar` | `boolean` | `true` | সাইডবার থেকে এই পেজ বাদ দিতে `false` সেট করুন |
| `collapsible` | `boolean` | — | সাইডবার গ্রুপ ভাঁজযোগ্য কিনা |

:::tip[ফাইল নামকরণ]{icon=bi:folder2-open}
`title` বা `sidebarTitle` না দেওয়া হলে, ডিরেক্টরির নাম পাঠযোগ্য ফরম্যাটে রূপান্তরিত হয় (যেমন `getting-started` → `Getting Started`)।
:::

:::info[HMR সমর্থন]{icon=mdi:refresh}
ডেভ মোডে স্বয়ংক্রিয় সাইডবার ব্যবহার করলে, রাউট ফাইল যোগ বা মুছে ফেললে সাইডবার স্বয়ংক্রিয়ভাবে পুনরায় তৈরি হবে — রিস্টার্টের প্রয়োজন নেই।
:::

## ম্যানুয়াল সাইডবার

আপনার Vite কনফিগে সাইডবার কাঠামো ম্যানুয়ালি সংজ্ঞায়িত করুন। এটি শিরোনাম, লিংক, গ্রুপিং এবং ক্রমের উপর সম্পূর্ণ নিয়ন্ত্রণ দেয়।

:::tip[স্বয়ংক্রিয় base]
কনফিগ করা লিংকগুলোতে স্বয়ংক্রিয়ভাবে [`base`](https://svelte.dev/docs/kit/$app-paths#base) প্রিফিক্স যোগ হবে
:::

:::important[অ্যাবসোলিউট মোড]
আপনাকে [`paths.relative`](https://svelte.dev/docs/kit/configuration#paths) `false` সেট করতে হবে

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    paths: {
      relative: false, // [svp! ++]
    },
  },
}

export default config
```
:::

```ts
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        sidebar: {
          '/foo/': [
            {
              title: 'Bar',
              to: '/foo/bar/',
            },
            {
              title: 'Zoo',
              collapsible: true,
              items: [
                {
                  title: 'Sub item',
                  to: '/sub/item/link',
                },
              ],
            },
            {
              title: 'External github page',
              to: 'https://github.com',
            },
          ],
        },
      }),
    }),
  ],
})
```

### `title`

সাইডবার আইটেমের শিরোনাম

### `to`

লিংক ঠিকানা

:::info[স্বয়ংক্রিয় বহিরাগত]{icon=ic:sharp-rocket-launch}
নেভবার আইটেমের বিপরীতে, সাইডবার আইটেম `Link` কম্পোনেন্ট ব্যবহার করে।
`http(s)` দিয়ে শুরু হওয়া লিংক স্বয়ংক্রিয়ভাবে বহিরাগত লিংক হিসেবে চিহ্নিত হবে।
:::

### `collapsible`

সাইডবার গ্রুপ ভাঁজযোগ্য কিনা তা নির্ধারণ করে। ডিফল্ট হল `false`

### `items`

সাব আইটেম

:::info[নেস্টেড আইটেম]{icon=bi:list-nested}
নেস্টেড আইটেম সমর্থিত
:::
