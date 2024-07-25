---
title: দ্রুত শুরু
---

## প্রজেক্ট তৈরী

নিম্নলিখিত কমান্ডগুলির মধ্যে একটি ব্যবহার করুন
আপনি কোন প্যাকেজ ম্যানেজার ব্যবহার করছেন তার উপর নির্ভর করে

@install-pkg(@sveltepress,create)

:::tip[PNPM কে প্রাধান্য দিন]
যতটা সম্ভব pnpm ব্যবহার করুন। এটি প্যাকেজ সংস্করণকে npm এর চেয়ে বেশি সম্মান করে।
:::

## একটি বিদ্যমান sveltekit প্রজেক্টে যোগ করা

### ভিট প্লাগিন প্যাকেজ ইন্সটল করুন

@install-pkg(@sveltepress/vite)

### vite.config.(js|ts) এ `sveltekit` plugin পরিবর্তন করুন 

```ts title="vite.config.(js|ts)"
// @noErrors
import { defineConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]

import { sveltepress } from '@sveltepress/vite' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

### svelte.config.js এর `extensions` অপশনে `'.md'` extension যুক্ত করুন

```ts title="svelte.config.js"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte'], // [svp! --]
  extensions: ['.svelte', '.md'], // add .md here // [svp! ++]
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
```
