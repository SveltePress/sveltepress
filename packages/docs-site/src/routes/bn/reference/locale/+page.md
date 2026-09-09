---
title: 'virtual:sveltepress/locale'
versionChanges:
  exclude: true
---

`@sveltepress/vite`-এ `locales` অপশনের মাধ্যমে মাল্টি-লোকাল সক্রিয় থাকলে, `virtual:sveltepress/locale` মডিউলটি সমাধানকৃত লোকাল কনফিগারেশন, সক্রিয় লোকাল নির্ণয়, স্থানীয় লিঙ্ক হেল্পার এবং ভাষা পরিবর্তনের গন্তব্য হিসাব প্রদান করে।

কাস্টম থিম এবং কম্পোনেন্ট এই মডিউলটি ইম্পোর্ট করে ভাষা নির্বাচক, স্থানীয়করণ লিঙ্ক এবং লোকাল-সচেতন ইন্টারফেস উপাদান তৈরি করতে পারে।

## লাইভ ডেটা

এই সাইটের `locales` কনফিগারেশন ডেটার একটি ইন্টারেক্টিভ পরিদর্শন নিচে দেওয়া হলো:

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import { locales } from 'virtual:sveltepress/locale'
</script>

<div class="viewer">
  <JsonViewer data={locales} />
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

### `locales`

* **টাইপ**: `LocalesConfig | null`

রুট প্রিফিক্স (যেমন `'/'`, `'/zh/'`, `'/bn/'`) দ্বারা সূচীকৃত মাল্টি-লোকাল কনফিগারেশন ডিকশনারি। একক লোকালের সাইটে এর মান `null` হয়।

### `resolveLocale`

* **টাইপ**: `(pathname: string, base?: string) => ResolvedLocale | null`

একটি URL পাথের জন্য সক্রিয় `ResolvedLocale` অবজেক্ট নির্ধারণ করে, যার মধ্যে রয়েছে:
* `prefix`: রুট প্রিফিক্স (যেমন `'/'`, `'/zh/'`, বা `'/bn/'`)।
* `lang`: BCP 47 ভাষার কোড (যেমন `'en'`, `'zh-CN'`, `'bn'`)।
* `label`: ব্যবহারকারীর ইন্টারফেসে প্রদর্শিত ভাষার নাম (যেমন `'English'`, `'简体中文'`, `'বাংলা'`)।
* `title`: এই লোকালের জন্য ঐচ্ছিক সাইট শিরোনাম ওভাররাইড।
* `description`: এই লোকালের জন্য ঐচ্ছিক সাইট বিবরণ ওভাররাইড।
* `theme`: এই নির্দিষ্ট লোকালের জন্য নির্ধারিত থিম অপশন।

### `resolveLocalizedPath`

* **টাইপ**: `(to: string, locale: ResolvedLocale | null, base?: string) => string`

প্রদত্ত অভ্যন্তরীণ লিঙ্ক পাথে নির্দিষ্ট লোকালের প্রিফিক্স যুক্ত করে। বাহ্যিক লিঙ্ক অপরিবর্তিত থাকে।

### `resolveLocaleSwitch`

* **টাইপ**: `(pathname: string, targetPrefix: string, base?: string) => LocaleSwitchTarget | null`

বর্তমান `pathname` থেকে লক্ষ্য ভাষা `targetPrefix`-এ পরিবর্তনের সময় গন্তব্য URL হিসাব করে। এটি `{ href, fallback }` প্রদান করে; লক্ষ্য ভাষায় পেজটি না থাকলে `fallback` মান `true` হয়।

### `default`

* **টাইপ**: `LocaleRuntime`

ডিফল্ট এক্সপোর্টটি হলো লোকাল রানটাইম অবজেক্ট, যাতে `locales`, `resolveLocale`, `resolveLocalizedPath` এবং `resolveLocaleSwitch` অন্তর্ভুক্ত থাকে।

## Typescript ব্যবহার

`virtual:sveltepress/locale`-এর সম্পূর্ণ টাইপ টিপস পেতে আপনার `src/app.d.ts`-এ `@sveltepress/vite/types` যুক্ত করুন:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// আপনার অন্যান্য টাইপ
```
