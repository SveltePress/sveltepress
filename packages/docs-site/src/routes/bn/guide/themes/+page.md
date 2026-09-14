---
title: থিম
---

## ভূমিকা

থিম ব্যবহার করতে `theme` অপশন sveltepress এ পাঠিয়ে দিন।

বিস্তারিত জানতে [ভিট প্লাগিন অপশন](/reference/vite-plugin/) এবং [ডিফল্ট থিম অপশন](/reference/default-theme/) পড়ুন।

| পছন্দ | উপযোগী ক্ষেত্র | Content model | Search |
|---|---|---|---|
| Default theme | Documentation, product guide ও API reference | Markdown অথবা Svelte-এ লেখা SvelteKit route | Algolia DocSearch অথবা custom wrapper-এর মাধ্যমে Meilisearch (production caveat দেখুন) |
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

[ব্লগ থিম গাইড](/guide/blog-theme/getting-started/) দিয়ে শুরু করুন। [লাইভ ডেমো](https://sveltepress.github.io/sveltepress/blog-demo/) সম্পূর্ণ প্রদর্শনী; [প্লেগ্রাউন্ডের ব্লগ থিম এন্ট্রি](/playground/) Blog starter আপনাআপনি চালু করে।

## কাস্টম থিম

Custom theme-এর কোনো Guide leaf নেই। [প্লেগ্রাউন্ড হোম](/playground/) থেকে খুলুন — ফিচার ডিরেক্টরি এন্ট্রি একটি নতুন লেখা Custom theme starter (Default Theme নেই, Blog theme নেই) থিম রুট লেআউটে আপনাআপনি চালু করে।

প্লেগ্রাউন্ডের [Kitchen sink](/playground/kitchen-sink/) এন্ট্রি হলো সবচেয়ে বড় Default Theme প্রকল্প যা একসাথে চলতে পারে (Markdown, Default Theme, i18n, versions, Vite plugin এবং virtual modules)। Blog theme ও custom theme সেই ট্রিতে থাকে না।
