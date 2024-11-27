---
title: থিম
---

## ভূমিকা

থিম ব্যবহার করতে `theme` অপশন sveltepress এ পাঠিয়ে দিন।

বিস্তারিত জানতে [ভিট প্লাগিন অপশন](/reference/vite-plugin/) এবং [ডিফল্ট থিম অপশন](/reference/default-theme/) পড়ুন।

## ডিফল্ট থিম

### ইন্সটল

@install-pkg(@sveltepress/theme-default)

### আপনার ভিট কনফিগে যুক্ত করুন

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

ডিফল্ট থিম সম্পর্কে আরো বিস্তারিত জানতে [ডিফল্ট থিম রেফারেন্স](/reference/default-theme/#Theme-Options)
