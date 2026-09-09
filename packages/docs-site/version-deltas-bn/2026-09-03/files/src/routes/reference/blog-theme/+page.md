---
title: ব্লগ থিম
versionChanges:
  exclude: true
---

`@sveltepress/theme-blog` প্যাকেজটি SveltePress-এর জন্য একটি আধুনিক এবং রেসপনসিভ ব্লগ থিম সরবরাহ করে, যাতে অন্তর্নির্মিত পোস্ট তালিকা, পেজিনেশন, ট্যাগ, ক্যাটাগরি, পড়ার সময় নির্ধারণ, RSS ফিড এবং Giscus মন্তব্য সুবিধা রয়েছে।

## ইনস্টলেশন

```sh
pnpm add -D @sveltepress/theme-blog
```

## Vite কনফিগারেশন

```ts title="vite.config.ts"
// @noErrors
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        author: {
          name: 'Jane Doe',
          avatar: '/avatar.png',
          bio: 'ওয়েব ডেভেলপমেন্ট নিয়ে নিয়মিত লিখি।',
        },
        pageSize: 10,
      }),
    }),
  ],
})
```

## থিম অপশনসমূহ

* `author`: `AuthorProfile | string` - লেখকের বিবরণ, যার মধ্যে `name`, `avatar`, `bio`, এবং `socials` অন্তর্ভুক্ত।
* `logo`: `string` - `static/` ডিরেক্টরিতে ব্লগ লোগোর পাথ।
* `footer`: `string` - কাস্টম ফুটার টেক্সট বা মার্কডাউন।
* `postsDir`: `string` - মার্কডাউন পোস্ট ডিরেক্টরি (ডিফল্ট: `'src/routes/posts'`)।
* `pageSize`: `number` - প্রতি পৃষ্ঠায় প্রদর্শিত পোস্টের সংখ্যা (ডিফল্ট: `10`)।
* `themeColor`: `ThemeColor` - `primary`, `secondary`, `bg`, এবং `surface` রঙ।
* `giscus`: `GiscusConfig` - Giscus মন্তব্য সিস্টেম কনফিগারেশন (`repo`, `repoId`, `category`, `categoryId`)।
* `socials`: `AuthorSocials` - সোশ্যাল লিংকসমূহ (GitHub, Twitter/X, Mastodon, Bluesky, RSS, ইমেইল)।
* `pwa`: `SvelteKitPWAOptions` - PWA সার্ভিস ওয়ার্কার অপশন।
* `highlighter`: Shiki কোড হাইলাইটার কনফিগারেশন।

## ভার্চুয়াল মডিউল

ব্লগ থিম প্লাগিন ব্লগের বিষয়বস্তু কোয়েরি করার জন্য বেশ কয়েকটি ভার্চুয়াল মডিউল প্রদান করে:

| মডিউল | এক্সপোর্ট / টাইপ | বিবরণ |
| --- | --- | --- |
| `virtual:sveltepress/blog-config` | `blogConfig: BlogThemeOptions` | `blogTheme()`-এ পাস করা ব্লগ কনফিগারেশন। |
| `virtual:sveltepress/blog-posts-meta` | `posts: BlogPostMeta[]` | সমস্ত প্রকাশিত পোস্টের মেটাডেটা তালিকা। |
| `virtual:sveltepress/blog-post/<slug>` | `default: BlogPost` | প্রাক-রেন্ডার করা HTML সহ পূর্ণাঙ্গ পোস্ট রেকর্ড। |
| `virtual:sveltepress/blog-tags-index` | `tags: Array<{ name, count }>` | সমস্ত ট্যাগ এবং সংশ্লিষ্ট পোস্টের সংখ্যা। |
| `virtual:sveltepress/blog-tag/<tag>` | `default: BlogPostMeta[]` | নির্দিষ্ট ট্যাগের সাথে মিলে যাওয়া পোস্টের তালিকা। |
| `virtual:sveltepress/blog-categories-index` | `categories: Array<{ name, count }>` | সমস্ত ক্যাটাগরি এবং সংশ্লিষ্ট পোস্টের সংখ্যা। |
| `virtual:sveltepress/blog-category/<cat>` | `default: BlogPostMeta[]` | নির্দিষ্ট ক্যাটাগরির সাথে মিলে যাওয়া পোস্টের তালিকা। |
| `virtual:sveltepress/blog-runtime` | `postsJsonDir, tagsJsonDir, categoriesJsonDir` | সার্ভার লোড ফাংশনের জন্য ডিস্ক ক্যাশ পাথ। **শুধুমাত্র সার্ভারের জন্য**। |

## পাবলিক কম্পোনেন্টসমূহ

আপনি থিমের অন্তর্নির্মিত Svelte কম্পোনেন্টগুলো সরাসরি ব্যবহার ও কাস্টমাইজ করতে পারেন:

* `@sveltepress/theme-blog/AuthorCard.svelte` - সংক্ষিপ্ত লেখক কার্ড।
* `@sveltepress/theme-blog/AuthorProfile.svelte` - সোশ্যাল লিংক সহ পূর্ণ লেখক প্রোফাইল।
* `@sveltepress/theme-blog/PostMeta.svelte` - পোস্টের তারিখ, পড়ার সময়, লেখক ও ট্যাগ বার।
* `@sveltepress/theme-blog/GiscusComments.svelte` - সংযুক্ত Giscus মন্তব্য কনটেইনার।
* `@sveltepress/theme-blog/GlobalLayout.svelte` - গ্লোবাল লেআউট র‍্যাপার।
* `@sveltepress/theme-blog/PostLayout.svelte` - একক পোস্ট পেজ লেআউট র‍্যাপার।
