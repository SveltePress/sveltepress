---
title: কনফিগারেশন
---

সব অপশন `vite.config.ts` এর `blogTheme()` এ পাস করা হয়।

## `BlogThemeOptions`

| অপশন | টাইপ | ডিফল্ট | বর্ণনা |
|---|---|---|---|
| `title` | `string` | — | সাইটের টাইটেল। `<title>`, সাইডবার ব্র্যান্ড, OG ট্যাগ এবং RSS ফিডে ব্যবহৃত হয়। |
| `description` | `string` | — | সাইটের বর্ণনা। meta এবং OG এ ব্যবহৃত হয়। |
| `base` | `string` | — | সাইটের সম্পূর্ণ URL (যেমন `https://example.com`)। অ্যাবসোলিউট RSS লিংক এবং OG ইমেজ URL তৈরিতে ব্যবহৃত হয়। |
| `author` | [`AuthorProfile`](#authorprofile) | — | সাইডবারে দেখানো লেখকের পরিচয়। |
| `about` | `{ html: string }` | — | সাইডবারে লেখকের তথ্যের নিচে রেন্ডার করা HTML ব্লক (সংক্ষিপ্ত রাখুন — স্বতন্ত্র About পেজ আর নেই)। |
| `navbar` | `Array<{ title, to }>` | — | লেখকের তথ্যের নিচের নেভ লিংক। `to` এ স্বয়ংক্রিয়ভাবে SvelteKit-এর `base` যুক্ত হবে। |
| `themeColor` | [`ThemeColor`](#themecolor) | Ember প্যালেট | ডার্ক মোড প্যালেট ওভাররাইড। |
| `themeColorLight` | [`ThemeColor`](#themecolor) | ক্রিম | লাইট মোড প্যালেট ওভাররাইড। |
| `defaultMode` | `'system' \| 'dark' \| 'light'` | `'system'` | ইউজার টগল করার আগের ইনিশিয়াল কালার মোড। |
| `postsDir` | `string` | `'src/posts'` | `*.md` পোস্ট স্ক্যান করার ডিরেক্টরি। |
| `demosDir` | `string` | `'src/demos'` | যে ডিরেক্টরির Svelte কম্পোনেন্ট পোস্টে ট্যাগ হিসেবে ব্যবহার করা যায়। দেখুন [ডেমো কম্পোনেন্ট](../writing-posts/#ডেমো-কম্পোনেন্ট)। |
| `liveCode` | `{ sourceLabel?: string }` | `{ sourceLabel: 'View code' }` | [লাইভ কোড](../writing-posts/#লাইভ-কোড) ব্লকের নিচের সোর্স দেখানো/লুকানোর টগলের লেবেল। |
| `pageSize` | `number` | `12` | হোম লিস্টিং এ প্রতি পেজে পোস্টের সংখ্যা। |
| `highlighter` | [`HighlighterOptions`](#highlighteroptions) | — | Shiki/Twoslash অপশন। |
| `rss` | `{ enabled, limit, copyright }` | enabled, 20 | RSS ফিড তৈরি। `static/rss.xml` এ লেখে। |
| `ogImage` | `{ enabled, fontPath, tagline }` | enabled | Satori দিয়ে প্রতি পোস্টের OG ইমেজ তৈরি। নেটিভ অ্যাডঅন লোড করা না গেলে এড়িয়ে যায়। |
| `giscus` | [`GiscusConfig`](#giscusconfig) | — | GitHub Discussions-ভিত্তিক কমেন্ট সক্রিয় করতে সেট করুন। |
| `search` | reserved | — | এখন কনফিগার করবেন না। বর্তমান রিলিজ সবসময় বিল্ট-ইন Pagefind সার্চ ব্যবহার করে। |

## `AuthorProfile`

```ts
interface AuthorProfile {
  name: string
  avatar?: string // অ্যাবসোলিউট URL অথবা /-দিয়ে শুরু static/ পাথ
  bio?: string
  socials?: {
    github?: string // ইউজারনেম, URL না
    twitter?: string // ইউজারনেম, URL না
    mastodon?: string // পূর্ণ প্রোফাইল URL
    bluesky?: string // 'name.bsky.social' ফরম্যাটের handle
    email?: string
    website?: string // পূর্ণ URL
    rss?: string // পূর্ণ URL অথবা /-দিয়ে শুরু পাথ
  }
}
```

## `ThemeColor`

```ts
interface ThemeColor {
  primary?: string // ডিফল্ট '#fb923c'
  secondary?: string // ডিফল্ট '#dc2626'
  bg?: string // ডিফল্ট '#1a0a00'
  surface?: string // ডিফল্ট '#2d1200'
}
```

## `HighlighterOptions`

```ts
interface HighlighterOptions {
  themeDark?: string // Shiki থিম, ডিফল্ট 'night-owl'
  themeLight?: string // Shiki থিম, ডিফল্ট 'vitesse-light'
  languages?: string[] // প্রিলোড করার ভাষা, ডিফল্টের সাথে মার্জ হবে
  twoslash?: boolean // Twoslash TypeScript হোভার তথ্য সক্রিয় করে
}
```

`languages` ঐচ্ছিক: Shiki-র অন্য যেকোনো ভাষা কোড ব্লকে প্রথমবার ব্যবহৃত হলে লোড হয়। ভাষার নাম case-insensitive (`Java` আর `java` একইভাবে কাজ করে), এবং অজানা নাম সাধারণ টেক্সট হিসেবে রেন্ডার হয়।

## `GiscusConfig`

```ts
interface GiscusConfig {
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number'
  reactionsEnabled?: boolean
  inputPosition?: 'top' | 'bottom'
  lang?: string
}
```

এই ভ্যালুগুলো [giscus.app](https://giscus.app/) থেকে নিন। `giscus` সেট করলে প্রতি পোস্টের নিচে স্বয়ংক্রিয়ভাবে একটি `GiscusComments` কম্পোনেন্ট রেন্ডার হয়। থিম স্যুইচ (লাইট/ডার্ক) অটোমেটিক প্রোপাগেট হয়।

## এনভায়রনমেন্ট ভ্যারিয়েবল

উদাহরণ সাইট বিল্ড টাইমে দুটি env ভ্যারিয়েবল পড়ে:

| ভ্যারিয়েবল | প্রভাব |
|---|---|
| `BASE_PATH` | SvelteKit-এর `paths.base`। সাবপাথে ডিপ্লয় করার সময় সেট করুন। |
| `SITE_URL` | `blogTheme()` এর `base` ওভাররাইড করে। OG/RSS অ্যাবসোলিউট URL তৈরিতে ব্যবহৃত হয়। |

থিম নিজে এগুলো পড়ে না — এগুলো আপনার `svelte.config.js` এবং `vite.config.ts` দিয়ে ওয়্যার করা হয়।
