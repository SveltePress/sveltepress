---
title: ডিফল্ট থিম
---

## ইন্সটল

@install-pkg(@sveltepress/theme-default)

## আপনার vite config এ যুক্ত করুন

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'

import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

## এক নজরে Types 

@code(/../theme-default/types.d.ts)

## থিম অপশন

### `navbar`

* `title`  
  ন্যাভবার আইটেমের লেবেল টেক্সট
* `to`  
  লিংক অ্যাড্রেস
* `icon`
  HTML স্ট্রিং। `title` এর পরিবর্তে এইচটিএমএল কন্টেন্ট দেখাবে। ন্যাভবারে কাস্টম আইকন দেখাতে এটি উপকারী। 
* `external`  
  লিংকটি কি এক্সটার্নাল কিনা তা নির্ধারণ করে। 
  এক্সটার্নাল আইকন দেখাবে যদি `true` সেট করা থাকে। 
* `items`  
  চিলড্রেনের লিংক। এই প্রপ দেয়া হলে ড্রপডাউন দেখাবে সিংগেল ন্যাভ লিং না দেখিয়ে

### `discord`
ডিসকর্ডের চ্যাট চ্যানেল লিংক 
এটি দেয়া হলে ন্যাভবারে ডিসকর্ডের আইকন দেখাবে।

### `github`
গিটহাবের রিপোর লিংক 
এটি দেয়া হলে ন্যাভবারে গিটহাবের আইকন দেখাবে।

### `logo`

লোগো ইমেজ 
যা ন্যাভবারে দেখাবে

### `sidebar`

একটি অবজেক্ট, কী হবে গ্রুপের রাউটের নাম, ভ্যালু হবে নিম্নে বর্ণিত ফিল্ডসহ অ্যারে অফ অবজেক্ট:

* `title`  
  সাইডবার আইটেমের লেবেলের লেখা
* `collapsible`  
  কলাপ্স করা যায় কিনা তা নির্ধারণ করে। 
* `to`  
  লিংক অ্যাড্রেস
* `items`  
  চিলড্রেনের লিংক। এটি প্রোভাইড করা হলে একক সাইডবার আইটেমের পরিবর্তে সাইডবার গ্রুপ দেখাবে। 

### `highlighter`

একটি অবজেক্ট যাতে কাস্টম হাইলাইট অপশন থাকে। 

* `languages` - সাপোর্টেড হাইলাইট ল্যাংগুয়েজ কাস্টমাইজ করা। 
ডিফল্ট হচ্ছে: `['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']`
* `themeLight` - কোড থিম যা লাইট মোডে অ্যাপ্লাই হবে, ডিফল্ট হচ্ছে `vitesse-light`
* `darkTheme` - কোড থিম যা ডার্ক মোডে অ্যাপ্লাই হবে, ডিফল্ট হচ্ছে `night-owl`
* `twoslash` -  [Twoslash](/guide/default-theme/twoslash/) চালু করতে `true` সেট করুন. ডিফল্টে `false`

:::important[টিপ]
আপনি সব সাপোর্টেড ল্যাংগুয়েজ এবং থিম [Shiki Repo](https://github.com/shikijs/shiki) তে পাবেন
:::

### `editLink`

এই লিংকটি edit this page on github বাটনে থাকে। 
উদাহরণস্বরূপ, এই সাইটটি `https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route` ব্যবহার করে। 

`:route` রাউট প্যাথ বোঝায়, যেমন: /foo/bar/+page.md

### `ga`

[Google Analytics](https://analytics.google.com/) থেকে প্রোভাইডকৃত আইডি। 
দেখতে অনেকটা এরকম `G-XXXXXXX`

সাইট-হেডে gtag স্ক্রিপ্ট যুক্ত করে। 

### `docsearch`

* appId
* apiKey
* indexName

এই সব ভ্যলু docsearch প্রোভাইড করে।   
আরো বিস্তারিত জানতে [Docsearch](https://docsearch.algolia.com/) ভিজিট করুন। 

### `pwa`

বিস্তারিত জানতে [PWA](/guide/default-theme/pwa/) দেখুন

### `themeColor`

local pwa application হিসেবে ওপেন করলে উইন্ডোবারের রঙ। 

* `light` - লাইট থিমে প্রযোজ্য রঙ।
* `dark` - ডার্ক থিমে প্রযোজ্য রঙ।
* `gradient` - গ্রেডিয়েন্ট থিম কালার। হোমপেজে অ্যাকশন বাটন ও মেইন টাইটেলে ব্যবহার হবে। ডিফল্ট হচ্ছে:
```js
const defaultGradient = {
  start: '#fa709a',
  end: '#fee140',
}
```
* `primary` - সাইটের প্রাইমারি থিম কালার
* `hover` - হোভার করা অবস্থায় লিংকের কালার

### `i18n`

ফিক্সড টেক্সট কন্টেন্ট যা আপনার কনফিগ দ্বারা পরিবর্তিত হতে পারে

* `onThisPage` -  "এই পেজে আছে"/"সূচীপত্র" এর লেখা
* `suggestChangesToThisPage` - "এই পেজে পরিবর্তন সাজেস্ট করুন" এর লেখা
* `lastUpdateAt` - "সর্বশেষ আপডেট:" এর লেখা
* `previousPage` - "পূর্ববর্তী" এর লেখা
* `nextPage` - "পরবর্তী" এর লেখা
* `expansionTitle` - markdown বা svelte live code এর "কোড দেখতে বা হাইড করতে ক্লিক করুন" এর লেখা 
* `pwa` - pwa prompt এর relative টেক্সট কন্টেন্ট. নিচের সব ফিল্ডই pwa prompt এর মতই 
  * `tip`
  * `reload`
  * `close`
  * `appReadyToWorkOffline`
  * `newContentAvailable`
* `footnoteLabel` - অটো জেনারেটেড ফুটনোট টাইটেলে। ডিফল্ট হচ্ছে `"Footnotes"`

### `preBuildIconifyIcons`

[Iconify](https://iconify.design/) এর আইকন যা আপনি ভবিষ্যত ব্যবহারের জন্য প্রিবিল্ড করতে চান।  
একটি অবজেক্ট, কী হচ্ছে কালেকশন নেম, ভ্যালু হচ্ছে আইকনের অ্যারে। 
উদাহরণস্বরূপ, এগুলো হচ্ছে ঐসব আইকন যা এই সাইটে ব্যবহার করা হচ্ছে

@code(/vite.config.ts,29,41)

এই আইকনগুলো দেখতে এমন:

```svelte live
<script>
  import { IconifyIcon } from '@sveltepress/theme-default/components'
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="flex items-center gap-4 text-[48px] flex-wrap">
  {#each Object.entries(themeOptions.preBuildIconifyIcons || {}) as [collection, names]}
    {#each names as name}
      <div>
        <IconifyIcon {collection} {name} />
      </div>
    {/each}
  {/each}
</div>
```

## গ্লোবাল কনটেক্সট

গ্লোবাল কনটেক্সট কী আছে এখানে- `@sveltepress/theme-default/context`। আপনি সকল কনটেক্সট [`getContext`](https://svelte.dev/docs/svelte#getcontext) এপিআই দিয়ে পাবেন। 

এটি একটি উদাহরণ:
```svelte live
<script lang="ts">
  import { getContext } from 'svelte'
  import type { SveltepressContext } from '@sveltepress/theme-default/context'
  import { SVELTEPRESS_CONTEXT_KEY } from '@sveltepress/theme-default/context'

  const { isDark } = getContext<SveltepressContext>(SVELTEPRESS_CONTEXT_KEY)
</script>

<div class:dark-text="{$isDark}" class="text-10">
  isDark: {$isDark}
</div>
<style>
  .dark-text {
    --at-apply: 'text-red';
  }
</style>
```

সকল কনটেক্সট:
* `$isDark` - বর্তমান থিম কি ডার্ক কিনা- তা নির্দেশ করে। এটি একটি [reactive svelte store](https://svelte.dev/docs/svelte-store).


## ভার্চুয়াল মডিউল

### `virtual:sveltepress/theme-default`

এই মডিউল `defaultTheme()` ফাংশনে পাস করে দেয়া থিম অপশন আয়ত্বে রাখে। 

এখানে এই সাইটের থিম অপশন উদাহরণ হিসেবে দেখানো হলো:

```svelte live
<script>
  import themeOptions from 'virtual:sveltepress/theme-default'
</script>
<div class="viewer">
  <pre>
    {JSON.stringify(themeOptions, null, 2)}
  </pre>
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
```

## Typescript এর ব্যবহার

থিম অপশন এবং ভার্চুয়াল মডিউল টাইপ টিপস পেতে src/app.d.ts তে `@sveltepress/theme-default/types` যুক্ত করতে হবে 

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/theme-default/types" />

// Your other types
```
