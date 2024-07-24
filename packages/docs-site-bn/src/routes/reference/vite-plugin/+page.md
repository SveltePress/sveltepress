---
title: Vite প্লাগিন
---

## এক নজরে Types

@code(/../vite/src/types.ts)

## প্লাগিন অপশন

### `siteConfig`

* `title`: সাইটের টাইটেল। না থাকলে `'Untitled site'` দেখাবে।
* `description`: সাইটের ডেসক্রিপশন। না থাকলে `'Build by sveltepress'` দেখাবে।

### `addInspect`

যদি `true` সেট করা হয়, তাহলে [Vite plugin inspect](https://github.com/antfu/vite-plugin-inspect) যোগ করা হবে।
ভিট পাইপলাইন দেখা ও পর্যবেক্ষণ করা বেশ উপকারী। 

### `theme`

নিম্নে [ResolvedTheme](#ResolvedTheme) দেখুন

### `remarkPlugins`

The remark plugins ব্যবহার করা হয়েছে মার্কডাউন এর জন্য।   
আরো জানতে [Remark plugins](https://github.com/remarkjs/remark#plugins) পড়ুন। 

### `rehypePlugins`  

The rehype plugins ব্যবহার করা হয়েছে html জেনারেট করার জন্য।
আরো জানতে [Rehype plugins](https://github.com/rehypejs/rehype#plugins) পড়ুন।

## ResolvedTheme

<!-- @code(/../vite/src/types.ts,13,25) -->

### `name`   

থিমের নাম

### `globalLayout`  

গ্লোবাল লে আউটের অ্যাবসোলুট পাথ। **svelte ফাইল হতে হবে**  
যেমন: `path.resolve(process.cwd(), 'ThemeGlobalLayout.svelte')`

### `pageLayout`  

পেজ লে আউটের অ্যাবসোলুট পাথ **svelte ফাইল হতে হবে**  
যেমন: `path.resolve(process.cwd(), 'ThemePageLayout.svelte')`
  
### `vitePlugins`  

* যদি এক বা একাধিক প্লাগিন পাস করা হয়, সেই প্লাগিনগুলো `sveltepress` এর সামনে অ্যাপ্লাই করা হবে।  
* যদি একটি ফাংশন পাস করা হয়, এটি `sveltepress` অ্যাক্সেপ্ট করবে এবং প্লাগিনের গ্রুপ রিটার্ন করবে।   
আপনি রিটার্নকৃত প্লাগিন চেইনে `sveltepress` এর প্লাগিন অর্ডার কাস্টমাইজ করতে পারেন। 

:::info[থিম ভিট প্লাগিন সম্পর্কে]{icon=vscode-icons:file-type-vite}
  এটি হয়ত একটু অদ্ভুত যে থিমের ভিট প্লাগিন আছে।  
  কিন্তু এটি উপকারী যখন থিম কিছু [ভার্চুয়াল মডিউল](https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention) যুক্ত করতে চায় অথবা কিছু টেম্প ফাইল তৈরি করতে চায়। 
:::

### `highlighter`  

কোড হাইলাইটিং এর জন্য ব্যবহৃত।   
যেমন, ডিফল্ট থিম [shiki](https://github.com/shikijs/shiki) ব্যবহার করে।  
আপনি বিস্তারিত ব্যবহারবিধি জানতে [ডিফল্ট থিম হাইলাইটার সোর্স কোড](https://github.com/Blackman99/sveltepress/blob/256c1abe6be51d37fa1ff5f9148368207c47a7ae/packages/theme-default/src/markdown/highlighter.ts) চেক করতে পারেন। 

### `remarkPlugins`  

The remark plugins ব্যবহৃত হয় মার্কডাউন পার্সিং এর জন্য।  
বিস্তারিত জানতে [Remark plugins](https://github.com/remarkjs/remark#plugins) পড়ুন। 

### `rehypePlugins`  

html জেনারেটরের জন্য The rehype plugins ব্যবহৃত হয়।
বিস্তারিত জানতে [Rehype plugins](https://github.com/rehypejs/rehype#plugins) পড়ুন। 

:::important[প্লাগিনের ধারাবাহিকতা]{icon=solar:reorder-outline}
থিম কর্তৃক প্রোভাইডকৃত The remark এবং rehype plugins তা ভিট প্লাগিনের প্রোভাইডকৃত প্লাগিনের পূর্বে কল করা হবে।
উদাহরণস্বরূপ:
```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/* theme options */),
      remarkPlugins: [/* yourRemarkPlugin */]
    })
  ]
})
```
yourRemarkPlugin রান হবে ডিফল্ট থিমের remark plugins এর পরে।  
:::

### `footnoteLabel`

ফুটনোটের টাইটেল কাস্টমাইজ করতে। ডিফল্ট হচ্ছে `"Footnotes"`

## Virtual modules

### `virtual:sveltepress/site`

এই মডিউল siteConfig কে হোল্ড করে। এখানে একটি উদাহরণ- 

```svelte live
<script>
  import siteConfig from 'virtual:sveltepress/site'
</script>

<p>The site title is: {siteConfig.title}</p>
<p>The site description is: {siteConfig.description}</p>
```

## Low level API

The @sveltepress/vite এর `mdToSvelte` একটি লোড লেভেল এপিআই ফাংশন আছে  
এটি Sveltepress এ  সকল বড় বড় মার্কডাউন রেন্ডারের জন্য ব্যবহৃত হয়।  
এটি Svelte এর সাথে সম্পৃক্ত আরো বেসিক মার্কডাউন রেন্ডারিং ইঞ্জিনের জন্য ব্যবহার করা যাবে ।

ব্যবহারবিধি:

```ts ln
import { mdToSvelte } from '@sveltepress/vite'

const mdContent = `
---
title: Foo
---
<script>
  const foo = 'bar'
</script>
# Title

foo in script is: {foo}

[Foo Link](https://foo.bar)
`

const { code, data } = await mdToSvelte({
  mdContent,
  remarkPlugins: [], // your custom remark plugins
  rehypePlugins: [], // your custom rehype plugins
  highlighter: async (code, lang, meta) => Promise.resolve('The rendered highlighted code html'), // your custom code highlighter
  filename: 'foo.md', // the virtual file path
})

// The rendered svelte code
code

// The frontmatter object, { title: 'Foo' }
data
```

## Typescript এর ব্যবহার 

প্লাগিন অপশন এবং ভার্চুয়াল মডিউল টাইপ টিপসের জন্য src/app.d.ts তে `@sveltepress/vite/types` যুক্ত করতে হবে 

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// এখানে আপনার অন্যান্য টাইপ থাকবে
```
