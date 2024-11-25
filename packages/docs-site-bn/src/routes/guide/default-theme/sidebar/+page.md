---
title: সাইডবার
---

## ভূমিকা

থিম ডিফল্টে `sidebar` অপশন পাঠিয়ে দিয়ে সাইডবার কনফিগার করা যাবে

## উদাহরণ

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
                  to: '/sub/item/link'
                }
              ]
            },
            {
              title: 'External github page',
              to: 'https://github.com'
            }
          ]
        }
      })
    })
  ]
})
```

### `title`

সাইডবারের আইটেমের টাইটেল

### `to`

লিংক অ্যাড্রেস

:::info[অটো এক্সটার্নাল]{icon=ic:sharp-rocket-launch}
ন্যাভবার আইটেমের মত না, সাইডবার আইটেম `Link` কম্পোনেন্ট ব্যবহার করে। যার অর্থ হচ্ছে- `http(s)` দিয়ে শুরু হওয়া লিংক এক্সটার্নাল লিংক হিসেবে অটোমেটিক চিহ্নিত হবে।
:::

### `collapsible`

সাইডবার গ্রুপ কি ভাজ করার যোগ্য কিনা তা নির্ধারণ করে। ডিফল্টে হচ্ছে `false`

### `items`

সাব আইটেম

:::info[নেস্টেড আইটেম]{icon=bi:list-nested}
নেস্টেড আইটেম সাপোর্ট করে
:::
