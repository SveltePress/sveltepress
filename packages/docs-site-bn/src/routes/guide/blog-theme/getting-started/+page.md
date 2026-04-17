---
title: শুরু করা
---

:::tip[আগে লাইভ ডেমো দেখুন]{icon=noto:rocket}
স্ক্যাফোল্ড করার আগে **লাইভ ডেমোটা এক ঝলক দেখে নিন — [sveltepress.github.io/sveltepress/blog-demo](https://sveltepress.github.io/sveltepress/blog-demo/)**। এই পেজে যা কিছু বর্ণনা করা হয়েছে, সব সেখানে ইতিমধ্যেই চালু অবস্থায় আছে।

সোর্স: monorepo-এর [`packages/example-blog`](https://github.com/SveltePress/sveltepress/tree/main/packages/example-blog)। রেপো ক্লোন করে `pnpm install && pnpm dev` চালালেই `localhost:4173`-এ একটি রান করার উপযোগী রেফারেন্স প্রজেক্ট পাবেন।
:::

`@sveltepress/theme-blog` হলো ম্যাগাজিন-স্টাইলের একটি ব্লগ থিম — বাম পাশে সাইডবার, ম্যাসনরি পোস্ট গ্রিড, প্রতি পোস্টের জন্য OG ইমেজ, RSS, Pagefind সার্চ এবং Giscus কমেন্ট সাপোর্ট করে। এই পেজে একটি কাজ করা ব্লগ স্ক্যাফোল্ড করার ধাপগুলো দেখানো হয়েছে।

## ইনস্টল

@install-pkg(@sveltepress/theme-blog)

এই থিমের জন্য `@sveltejs/adapter-static` দরকার, কারণ এটি সম্পূর্ণ স্ট্যাটিক সাইট (প্রি-রেন্ডার করা HTML, JSON, RSS, OG ইমেজ) তৈরি করে।

@install-pkg(@sveltejs/adapter-static)

## Vite কনফিগার করুন

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'My Blog',
        description: 'Thoughts on Svelte and the web.',
        base: 'https://example.com',
        author: {
          name: 'Your Name',
          avatar: '/avatar.png',
          bio: 'সাইডবারে দেখানোর জন্য সংক্ষিপ্ত বায়ো।',
          socials: {
            github: 'your-handle',
            twitter: 'your-handle',
            rss: '/rss.xml',
          },
        },
        navbar: [
          { title: 'হোম', to: '/' },
          { title: 'টাইমলাইন', to: '/timeline/' },
          { title: 'ট্যাগ', to: '/tags/' },
        ],
      }),
    }),
  ],
})
```

## SvelteKit কনফিগার করুন

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: '404.html',
    }),
    prerender: {
      handleMissingId: 'ignore',
      handleUnseenRoutes: 'ignore',
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: false,
    },
  },
  compilerOptions: {
    runes: true,
  },
}
```

সাবপাথে ডিপ্লয় করার জন্য (যেমন GitHub Pages প্রজেক্ট সাইট) `BASE_PATH` ব্যবহার করা হয়। রুট পাথে ডিপ্লয় করলে এই env ভ্যারিয়েবল সেট করার দরকার নেই।

## প্রথম পোস্ট লিখুন

`src/posts/hello-world.md` তৈরি করুন:

```md title="src/posts/hello-world.md"
---
title: Hello world
date: 2026-04-17
tags: [intro]
category: meta
excerpt: নতুন ব্লগের প্রথম পোস্ট।
---

# Hello

আমার ব্লগে স্বাগতম। সবকিছুই markdown।
```

## অটো-স্ক্যাফোল্ডেড রুট

পরবর্তী `vite dev` বা `vite build` এ থিম এই ফাইলগুলো না থাকলে তৈরি করবে। যেকোনো ফাইল নির্দ্বিধায় এডিট করুন — স্ক্যাফোল্ডার শুধু অনুপস্থিত ফাইল তৈরি করে।

| পাথ | কাজ |
|---|---|
| `src/routes/+layout.ts` | প্রি-রেন্ডার এবং `trailingSlash: 'always'` সক্রিয় করে |
| `src/routes/+layout.svelte` | `GlobalLayout` দিয়ে পেজগুলো র‍্যাপ করে |
| `src/routes/+page.{server.ts,svelte}` | পেজিনেটেড হোম |
| `src/routes/page/[n]/...` | তালিকার ২ নং ও পরবর্তী পেজ |
| `src/routes/posts/[slug]/...` | আলাদা পোস্ট পেজ |
| `src/routes/tags/+page.svelte` | ট্যাগ ইনডেক্স |
| `src/routes/tags/[tag]/...` | নির্দিষ্ট ট্যাগের পোস্ট |
| `src/routes/categories/[cat]/...` | নির্দিষ্ট ক্যাটাগরির পোস্ট |
| `src/routes/timeline/+page.svelte` | আর্কাইভ টাইমলাইন |

## বিল্ড

```bash
pnpm vite build && pnpm pagefind --site dist
```

Pagefind স্টেপটি বিল্ড হওয়া সাইটে ইনডেক্স তৈরি করে যাতে সার্চ মডাল (`⌘K` / `Ctrl+K`) কাজ করে। সার্চ ব্যবহার না করলে এটি স্কিপ করতে পারেন।

ফলাফল `dist/` একটি স্ট্যাটিক বান্ডেল — যেকোনো স্ট্যাটিক হোস্টে ডিপ্লয় করা যাবে।
