---
title: 'virtual:sveltepress/site'
versionChanges:
  exclude: true
---

`virtual:sveltepress/site` ভার্চুয়াল মডিউলটি `sveltepress({ siteConfig })`-এ কনফিগার করা সাইট মেটাডেটা (`title`, `description`) প্রদান করে।

কাস্টম থিম, কম্পোনেন্ট এবং লেআউট টেমপ্লেট এই মডিউলটি ইম্পোর্ট করে গ্লোবাল সাইট নাম ও বিবরণ প্রদর্শন করতে পারে বা মেটা ট্যাগ তৈরি করতে পারে।

## লাইভ ডেটা

এই সাইটের `siteConfig` ডেটার একটি ইন্টারেক্টিভ পরিদর্শন নিচে দেওয়া হলো:

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import siteConfig from 'virtual:sveltepress/site'
</script>

<div class="viewer">
  <JsonViewer data={siteConfig} />
</div>
<style>
  .viewer {
    max-height: 40vh;
    overflow: auto;
  }
  :global(html.dark) .viewer {
    --discovery-background-color: #1a1a1a;
    --sjd-app-bg: #1a1a1a;
    --sjd-fmt-color: #999;
    --sjd-fmt-hover-color: #aaa;
    --sjd-fmt-property-color: #d17a8c;
    --sjd-fmt-number-color: #0f8dc2;
    --sjd-fmt-atom-color: #0f8dc2;
    --sjd-fmt-string-color: #7faf20;
    --sjd-fmt-string-underline-color: #85ab51;
    --sjd-fmt-string-hover-color: #97cf26;
    --sjd-ui-color: #ccc;
    --sjd-match-bg: #565638;
    --sjd-match-border: #a7a73b;
    --sjd-error-border: #0004;
    --sjd-error-bg: #622b29;
    --sjd-error-color: #c66;
    --sjd-error-message-bg: #443232;
    --sjd-toggle-color: #72b372;
    --sjd-touch-button-color: #aaa;
    --sjd-touch-button-bg: #50505080;
    --sjd-popup-bg: #333;
    --sjd-popup-color: #ccc;
    --sjd-popup-notes-color: #999;
    --sjd-popup-error-color: #e66;
    color-scheme: dark;
  }
</style>
```

## মডিউল এক্সপোর্ট

### `default`

* **টাইপ**: `{ title: string, description: string }`

ডিফল্ট এক্সপোর্টটি হলো সাইট কনফিগারেশন অবজেক্ট:

* `title`: `siteConfig.title`-এ কনফিগার করা সাইট শিরোনাম। উল্লেখ না থাকলে ডিফল্ট `'Untitled site'`।
* `description`: `siteConfig.description`-এ কনফিগার করা সাইট বিবরণ। উল্লেখ না থাকলে ডিফল্ট `'Build by sveltepress'`।

## Typescript ব্যবহার

`virtual:sveltepress/site`-এর সম্পূর্ণ টাইপ টিপস পেতে আপনার `src/app.d.ts`-এ `@sveltepress/vite/types` যুক্ত করুন:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// আপনার অন্যান্য টাইপ
```
