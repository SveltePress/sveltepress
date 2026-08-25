---
title: থিম
---

## ভূমিকা

থিম ব্যবহার করতে `theme` অপশন sveltepress এ পাঠিয়ে দিন।

বিস্তারিত জানতে [ভিট প্লাগিন অপশন](/reference/vite-plugin/) এবং [ডিফল্ট থিম অপশন](/reference/default-theme/) পড়ুন।

| পছন্দ | উপযোগী ক্ষেত্র | Content model | Search |
|---|---|---|---|
| Default theme | Documentation, product guide ও API reference | Markdown অথবা Svelte-এ লেখা SvelteKit route | Algolia DocSearch; custom-search hook এখনও production-ready নয় |
| Blog theme | Editorial site ও সময়ভিত্তিক publication | `src/posts`-এর Markdown এবং generated route | Built-in Pagefind |

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

## ব্লগ থিম

ব্লগ থিম post indexing, pagination, tag, category, RSS, Open Graph image, related post, comment এবং Pagefind search UI দেয়। এটি static site তৈরি করে এবং বর্তমানে `@sveltejs/adapter-static` ও Pagefind post-build step প্রয়োজন।

[ব্লগ থিম গাইড](/guide/blog-theme/getting-started/) দিয়ে শুরু করুন এবং runnable reference হিসেবে [লাইভ ডেমো](https://sveltepress.github.io/sveltepress/blog-demo/) ব্যবহার করুন।
