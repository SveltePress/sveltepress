---
title: Google Analytics
---

## পরিচিতি

Google Analytics ব্যবহার করতে ডিফল্ট থিমে `ga` পাঠিয়ে দিন।
ভ্যালু হচ্ছে ঐ আইডি যা [Google Analytics](https://analytics.google.com/analytics/web/) দিয়েছে।
এরকম দেখতে `G-XXXXXXXXX`.
সাইট হেডে gtag স্ক্রিপ্ট পরিবর্তিত হয়ে যাবে।

## কনফিগের উদাহরণ

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        ga: 'G-XXXXXXXXX' // [svp! ++]
      })
    })
  ],
})
```
