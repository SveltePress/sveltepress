---
title: 'virtual:sveltepress/versions'
versionChanges:
  exclude: true
---

`@sveltepress/vite`-এ ডকুমেন্ট সংস্করণ ব্যবস্থাপনা সক্রিয় থাকলে, `virtual:sveltepress/versions` ভার্চুয়াল মডিউল সংস্করণ ম্যানিফেস্ট, রুট হেল্পার, রিলিজ পরিবর্তন তালিকা এবং সংস্করণ রানটাইমে অ্যাক্সেস প্রদান করে।

কাস্টম থিম এবং সাইট কম্পোনেন্ট এই মডিউলটি ইম্পোর্ট করে সংস্করণ নির্বাচক, জীবনচক্র সতর্কবার্তা ব্যানার, পরিবর্তন তালিকা প্রদর্শন এবং সংস্করণ-সচেতন অভ্যন্তরীণ লিঙ্ক তৈরি করতে পারে।

## লাইভ ডেটা

এই সাইটের সংস্করণ রানটাইম ডেটার একটি ইন্টারেক্টিভ পরিদর্শন নিচে দেওয়া হলো:

```svelte live
<script>
  import { JsonViewer } from 'svelte-json-discovery'
  import versions from 'virtual:sveltepress/versions'
</script>

<div class="viewer">
  <JsonViewer data={versions} />
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

### `manifest`

* **টাইপ**: `VersionManifest | null`

ডিফল্ট লোকাল (`'/'`)-এর সংস্করণ ম্যানিফেস্ট। ডকুমেন্ট সংস্করণ সক্রিয় না থাকলে এটি `null` হয়।

### `manifests`

* **টাইপ**: `Record<string, VersionManifest | null>`

লোকাল প্রিফিক্স (যেমন `'/'`, `'/zh/'`, `'/bn/'`) দ্বারা কী করা সংস্করণ ম্যানিফেস্টের ডিকশনারি। একক লোকালের সাইটে এটিতে `{ '/': manifest }` থাকে।

### `changeSets`

* **টাইপ**: `Record<string, VersionChangeSet>`

সংস্করণ আইডি দ্বারা সূচীকৃত রিলিজ পরিবর্তন তালিকার ডিকশনারি। প্রতিটি এন্ট্রিতে বেসলাইন সংস্করণের সাপেক্ষে `newPages` এবং `updatedPages` বিস্তারিত থাকে।

### `resolveVersionManifest`

* **টাইপ**: `(pathname: string) => VersionManifest | null`

প্রদত্ত রুট পাথের লোকাল প্রিফিক্সের উপর ভিত্তি করে সংশ্লিষ্ট `VersionManifest` নির্ধারণ করে।

### `resolveVersionChanges`

* **টাইপ**: `(versionId?: string, pathname?: string) => VersionChangeSet | null`

নির্দিষ্ট `versionId`-এর পরিবর্তন তালিকা প্রদান করে। বাদ দিলে এটি বর্তমান সংস্করণের পরিবর্তন নির্ধারণ করে। মাল্টি-লোকাল সাইটে ঐচ্ছিক `pathname` প্যারামিটারটি নির্দিষ্ট লোকালের ম্যানিফেস্ট নির্বাচন করে।

### `resolveVersionContext`

* **টাইপ**: `(pathname: string) => VersionContext | null`

একটি URL পাথের জন্য `VersionContext` নির্ধারণ করে, যার মধ্যে রয়েছে:
* `versionId`: সক্রিয় সংস্করণ আইডি (যেমন current বা কোনো ঐতিহাসিক সংস্করণ আইডি)।
* `version`: সংশ্লিষ্ট `DocumentationVersion` কনফিগারেশন অবজেক্ট।
* `logicalPath`: সংস্করণ ও লোকাল প্রিফিক্স বাদ দিয়ে সাধারণীকৃত রুট পাথ।
* `historical`: রুটটি কোনো সংরক্ষিত ঐতিহাসিক সংস্করণের কি না তা নির্দেশকারী `boolean` মান।
* `basePath`: সংস্করণ বেস পাথ (যেমন `'/v'` বা `'/bn/v'`)।
* `manifest`: নির্ধারিত `VersionManifest` ইনস্ট্যান্স।

### `resolveVersionedPath`

* **টাইপ**: `(to: string, context: VersionContext | null) => string`

ঐতিহাসিক সংস্করণ কনটেক্সটের মধ্যে অভ্যন্তরীণ লিঙ্ক পাথ নির্ধারণ করে। যদি টার্গেট রুটটি সেই ঐতিহাসিক সংস্করণে উপস্থিত থাকে, তবে সংস্করণযুক্ত লিঙ্ক প্রদান করে; অন্যথায় মূল পাথ প্রদান করে।

### `resolveVersionSwitch`

* **টাইপ**: `(pathname: string, targetVersionId: string) => VersionSwitchTarget | null`

`pathname` থেকে `targetVersionId` সংস্করণে পরিবর্তনের সময় গন্তব্য রুট গণনা করে। এটি `{ href, fallback }` প্রদান করে; টার্গেট সংস্করণে পেজটি না থাকলে এবং হোমপেজে ফলব্যাক হলে `fallback` মান `true` হয়।

### `default`

* **টাইপ**: `VersionRuntime`

ডিফল্ট এক্সপোর্টটি হলো সংস্করণ রানটাইম অবজেক্ট, যা সমস্ত হেল্পার ফাংশনের সাথে `manifest`, `manifests` এবং `changeSets` ধারণ করে।

## Typescript ব্যবহার

`virtual:sveltepress/versions`-এর সম্পূর্ণ টাইপ টিপস পেতে আপনার `src/app.d.ts`-এ `@sveltepress/vite/types` যুক্ত করুন:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// আপনার অন্যান্য টাইপ
```
