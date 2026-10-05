---
title: দ্রুত শুরু
---

## প্রয়োজনীয় পরিবেশ

- Node.js `^20.19.0` অথবা `>=22.12.0`
- Svelte 5, SvelteKit 2 (`2.65.1` বা পরের সংস্করণ) অথবা SvelteKit 3, এবং Vite 8
- pnpm 10 সুপারিশ করা হয়; create command npm, Yarn এবং Bun-ও সমর্থন করে

## প্রজেক্ট তৈরী

নিম্নলিখিত কমান্ডগুলির মধ্যে একটি ব্যবহার করুন
আপনি কোন প্যাকেজ ম্যানেজার ব্যবহার করছেন তার উপর নির্ভর করে

@install-pkg(@sveltepress@latest,create)

:::tip[PNPM কে প্রাধান্য দিন]
রেপোজিটরি ও তৈরি হওয়া template pnpm 10 দিয়ে যাচাই করা হয়।
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

### `sveltepress()` এর মাধ্যমে SvelteKit config দিন

:::since[SvelteKit 3 সমর্থন]{version="2026-10-05" id="sveltekit-3" summary="Sveltepress SvelteKit 3 সমর্থন করে। svelte.config.js আর পড়া হয় না, তাই SvelteKit config svelteKitOptions দিয়ে দিতে হয়।"}
SvelteKit 3 আর `svelte.config.js` পড়ে না, এবং ফাইলটি থাকলে চালু হতে অস্বীকার করে। এর অপশনগুলো (আগে `kit` এর ভেতরে থাকা সবকিছুসহ) `sveltepress({ svelteKitOptions })` এ সরিয়ে নিন, তারপর `svelte.config.js` মুছে ফেলুন। Sveltepress স্বয়ংক্রিয়ভাবে `'.md'` extension যুক্ত করে দেয়।

```ts title="vite.config.ts"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      svelteKitOptions: {
        preprocess: [vitePreprocess()],
        adapter: adapter({
          pages: 'dist',
        }),
      },
    }),
  ],
})
```
:::

:::tip[এখনও SvelteKit 2 ব্যবহার করছেন?]
SvelteKit 2-ও `svelteKitOptions` গ্রহণ করে। চাইলে `svelte.config.js` রেখে দিয়ে এর `extensions` এ `'.md'` যুক্ত করতে পারেন:

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
:::

## SvelteKit 3 এ আপগ্রেড

1. `@sveltejs/kit` কে `^3.0.0` এ এবং আপনার adapter কে এর SvelteKit 3 রিলিজে আপগ্রেড করুন, যেমন `@sveltejs/adapter-static` `^4.0.0`। SvelteKit 3 এর জন্য Node.js `>=22.17` প্রয়োজন।
2. নিজের কোড মাইগ্রেট করতে `npx sv migrate sveltekit-3` চালান, যেমন `$app/stores`, `$app/paths` এর `base` এবং `$lib` import।
3. নিশ্চিত করুন SvelteKit config উপরের মতো `sveltepress({ svelteKitOptions })` এ আছে। মাইগ্রেশন `svelte.config.js` কে আপনার Vite config এর একটি `sveltekit(...)` কলে সরিয়ে দেয়: সেই অবজেক্টটি `svelteKitOptions` এ সরিয়ে নিন এবং `sveltekit(...)` plugin সরিয়ে ফেলুন।

Sveltepress এর নিজের আর কোনো পরিবর্তন লাগে না। মনে রাখুন:

- `$lib` এর জায়গায় এখন `#lib` subpath import। [ভার্সন ম্যানেজমেন্ট](/guide/version-management/) `$lib/` এর মতোই `#lib/` import ট্র্যাক করে, তাই আপনার manifest যদি `$lib/**` শেয়ার করে, তবে `content.shared` এ `#lib/**`-ও যুক্ত করুন।
- Default Theme এর [`pwa`](/guide/default-theme/pwa/) অপশন `@vite-pwa/sveltekit` এর উপর নির্ভর করে, যা এখনও SvelteKit 3 সমর্থন করে না। SvelteKit 3 এ কোনো service worker তৈরি হয় না, এবং build একটি সতর্কবার্তা দেখায়।
