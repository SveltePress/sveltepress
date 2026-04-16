---
title: কাস্টমাইজেশন
---

## কালার প্যালেট

`themeColor` / `themeColorLight` দিয়ে ডার্ক বা লাইট প্যালেট ওভাররাইড করুন:

```ts
blogTheme({
  themeColor: {
    primary: '#fb923c',
    secondary: '#dc2626',
    bg: '#1a0a00',
    surface: '#2d1200',
  },
  themeColorLight: {
    primary: '#c2410c',
    bg: '#fef9f0',
    surface: '#fde8c8',
  },
})
```

যে কী গুলো বাদ দিবেন সেগুলোর জন্য থিম ডিফল্ট থাকবে। রানটাইমে এগুলো `[data-theme="dark"] .sp-blog-root` এবং `[data-theme="light"] .sp-blog-root` এ scoped CSS কাস্টম প্রোপার্টি হিসেবে inject হয়।

## CSS কাস্টম প্রোপার্টি

সব কম্পোনেন্ট এই ভ্যারিয়েবলগুলো পড়ে। নিজের স্টাইলে এগুলো ওভাররাইড করে সূক্ষ্ম নিয়ন্ত্রণ করুন:

| ভ্যারিয়েবল | কাজ |
|---|---|
| `--sp-blog-bg` | পেজ ব্যাকগ্রাউন্ড |
| `--sp-blog-surface` | কার্ড/সাইডবার ব্যাকগ্রাউন্ড |
| `--sp-blog-border` | সেপারেটর, কার্ড বর্ডার |
| `--sp-blog-text` | প্রাইমারি টেক্সট (টাইটেল) |
| `--sp-blog-content` | বডি টেক্সট |
| `--sp-blog-muted` | মেটা টেক্সট (তারিখ, কাউন্ট) |
| `--sp-blog-primary` | অ্যাকসেন্ট (লিংক, ট্যাগ, বাটন) |
| `--sp-blog-secondary` | সেকেন্ডারি অ্যাকসেন্ট |

## কম্পোনেন্ট প্রতিস্থাপন

`src/routes/` এর স্ক্যাফোল্ডেড ফাইলগুলো `@sveltepress/theme-blog/components/*` থেকে কম্পোনেন্ট ইমপোর্ট করে। কোনো একটি প্রতিস্থাপন করতে — যেমন পোস্ট কার্ড — `src/routes/+page.svelte` এডিট করে নিজের কম্পোনেন্ট দিন:

```svelte title="src/routes/+page.svelte"
<script lang="ts">
  import MyGrid from '$lib/MyGrid.svelte'

  const { data } = $props()
</script>

<MyGrid posts={data.posts} />
```

থিম এই বিল্ডিং ব্লকগুলো re-export করে:

- `@sveltepress/theme-blog/PostLayout.svelte`
- `@sveltepress/theme-blog/components/MasonryGrid.svelte`
- `@sveltepress/theme-blog/components/Timeline.svelte`
- `@sveltepress/theme-blog/components/Pagination.svelte`
- `@sveltepress/theme-blog/components/Sidebar.svelte`
- `@sveltepress/theme-blog/components/SearchModal.svelte`
- `@sveltepress/theme-blog/components/ReadingProgress.svelte`
- `@sveltepress/theme-blog/components/GiscusComments.svelte`
- `@sveltepress/theme-blog/components/RelatedPosts.svelte`
- `@sveltepress/theme-blog/components/TaxonomyHeader.svelte`

## সাবপাথে ডিপ্লয়

`svelte.config.js` এ `BASE_PATH` এবং `vite.config.ts` এ `SITE_URL` পড়ুন:

```js title="svelte.config.js"
export default {
  kit: {
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: false,
    },
  },
}
```

```ts title="vite.config.ts"
blogTheme({
  base: process.env.SITE_URL ?? 'http://localhost:4173',
  // ...
})
```

দুটি ভ্যারিয়েবল সেট করে বিল্ড করুন, যেমন `user.github.io/repo/blog` এ GitHub Pages প্রজেক্ট সাইটের জন্য:

```bash
BASE_PATH=/repo/blog SITE_URL=https://user.github.io/repo/blog \
  pnpm vite build && pnpm pagefind --site dist
```

থিম কম্পোনেন্টের সব ইন্টারনাল লিংক SvelteKit-এর `$app/paths` `base` ব্যবহার করে, তাই সাবপাথের নিচে এগুলো সঠিকভাবে resolve হয়। OG ইমেজ URL এবং RSS আইটেম URL `SITE_URL` ব্যবহার করে, যাতে সোশ্যাল ক্রলার পূর্ণ-কোয়ালিফাইড URL পায়।

## পেজ যোগ করা

`src/routes/` এর নিচে স্ক্যাফোল্ডার reserved না করা সবকিছুই আপনার। `src/routes/+layout.svelte` অপরিবর্তিত রাখলেই কাস্টম পেজগুলো স্বয়ংক্রিয়ভাবে `GlobalLayout` এ wrap হবে — প্রতিটি রুট সাইডবার + মেইন গ্রিডের ভিতরে রেন্ডার হয়।
