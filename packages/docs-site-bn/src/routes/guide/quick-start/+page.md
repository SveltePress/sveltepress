---
title: দ্রুত শুরু
---

## প্রজেক্ট তৈরী

নিম্নলিখিত কমান্ডগুলির মধ্যে একটি ব্যবহার করুন
আপনি কোন প্যাকেজ ম্যানেজার ব্যবহার করছেন তার উপর নির্ভর করে

@install-pkg(@sveltepress@latest,create)

:::tip[PNPM কে প্রাধান্য দিন]
যতটা সম্ভব pnpm ব্যবহার করুন। এটি প্যাকেজ সংস্করণকে npm এর চেয়ে বেশি সম্মান করে।
:::

## একটি বিদ্যমান sveltekit প্রজেক্টে যোগ করা

### ভিট প্লাগিন প্যাকেজ ইন্সটল করুন

@install-pkg(@sveltepress/vite)

### vite.config.(js|ts) এ `sveltekit` plugin পরিবর্তন করুন

```ts title="vite.config.(js|ts)"
import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]

import { sveltepress } from '@sveltepress/vite' // [svp! ++]

// @noErrors
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

:::warning[মূল `sveltekit()` plugin সরিয়ে ফেলুন]
`sveltepress()` ইতিমধ্যেই আপনার জন্য SvelteKit সেট আপ করে। `plugins` এ `sveltekit()` এবং `sveltepress()` উভয়ই রাখলে প্রতিটি Svelte ফাইল দুইবার কম্পাইল হয় এবং dev server `Expected token }` ত্রুটিসহ ক্র্যাশ করে।
:::

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

:::tip[`svelte.config.js` নেই? (নতুন SvelteKit কাঠামো)]
সাম্প্রতিক `npx sv create` দিয়ে তৈরি প্রজেক্টগুলো SvelteKit config সরাসরি `vite.config.ts` এ ইনলাইনভাবে রাখে এবং কোনো `svelte.config.js` থাকে না। সেই অপশনগুলো `sveltepress({ svelteKitOptions })` এ সরিয়ে নিন (Sveltepress স্বয়ংক্রিয়ভাবে `'.md'` extension যুক্ত করে দেয়) এবং আলাদা `sveltekit()` plugin সরিয়ে ফেলুন:

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-auto'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        compilerOptions: {
          runes: ({ filename }) =>
            filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
        },
        adapter: adapter(),
      },
    }),
  ],
})
```
:::
