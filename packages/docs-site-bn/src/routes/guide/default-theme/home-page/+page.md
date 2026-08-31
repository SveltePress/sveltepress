---
title: হোম পেজ
---

## Frontmatter

`src/routes/+page.(md|svelte)` ফাইলটি হোম পেজ হিসেবে ব্যবহৃত হবে।

Home frontmatter এরকম হতে পারে।
এই সাইট যেই frontmatter ব্যবহার করছে সেটিকে উদাহরণ হিসেবে দেখুন:

@code(../../../+page.md)

আপনি রেজাল্ট দেখতে [হোম পেজে](/) যেতে পারেন।

### `heroImage`

হোম পেজের লোগো। হাই কোয়ালিটির ইমেজ ব্যবহার করা উত্তম। Landing page-এর সম্পূর্ণ width content-এর জন্য রাখতে এবং default hero illustration লুকাতে এটিকে `false` করুন।

:::since[ডিফল্ট Hero visual localize করা]{version="2026-08-31" id="hero-code-localization" summary="i18n.heroCode দিয়ে ডিফল্ট দুই-প্যানেলের Hero preview localize করুন।"}
`heroImage` বাদ দিলে default theme একটি দুই-প্যানেলের code preview দেখায়। Theme-এর `i18n.heroCode` option দিয়ে visual-এর লেখাগুলো localize করা যায়:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  i18n: {
    heroCode: {
      title: 'হ্যালো',
      messageBefore: '',
      messageStrong: 'Markdown',
      messageAfter: '-এ Svelte',
      tipLabel: 'পরামর্শ',
      counterLabel: 'গণনা: ১',
    },
  },
})
```

`messageBefore`, `messageStrong`, এবং `messageAfter` source pane-এর Markdown বাক্য তৈরি করে। `tipLabel` ও `counterLabel` rendered pane-এর লেখা বদলায়।
:::

### `tagline`

সাইটের টাইটেল এবং ডেসক্রিপশনের নিচে থাকা ছোট ডেসক্রিপশন

### `actions`

অ্যাকশন বাটন
* `label`
  অ্যাকশন নাটনের লেবেলের লেখা
* `to`
  অ্যাকশন নাটনের লেবেলের লিংক
* `external`
  অ্যাকশন নাটনের ডানদিকে এক্সটার্নাল আইকন দেখাবে কিনা তা নির্ধারণ করে

### `features`

ফিচার কার্ড

* `title`
  টাইটেল
* `description`
  টাইটেলের নিচে থাকা ডেসক্রিপশন
* `icon`
  কাস্টম আইকন কনফিগ
  * `type` - `'svg' | 'iconify'`
  * `value` - svg টাইপের আইকনে ব্যবহারের জন্য svg কন্টেন্ট
  * `collection` - iconify এর কালেকশন নাম
  * `name` - iconify এর কালেকশনের আইকনের নাম
* `link`
  ফিচার কার্ডে ক্লিক করে যেই লিংকে যাবে, সেটা।
  যদি http(s) দিয়ে লিংক শুরু হয়ে থাকে, তাহলে অটোমেটিক লিংক হিসেবে চিনে নেবে এবং উপরের ডানদিকে এক্সটার্নাল আইকন থাকবে।
  এবং লিংক প্রোভাইড করা হলে ফিচার কার্ডে ক্লিক-করার-যোগ্য স্টাইল থাকবে।

:::important[প্রি-বিল্ড আইকন আবশ্যক]{icon=tabler:icons}
iconify আইকন [প্রিবিল্ড iconify কনফিগ](/reference/default-theme/#preBuildIconifyIcons) এ থাকতে হবে।
:::

### `home`

Root route default ভাবে home layout ব্যবহার করে। অন্য যেকোনো route-এ `home: true` দিলে page-টির নিজস্ব `title`, `description`, এবং `tagline` সহ একই landing-page presentation ব্যবহার করা যাবে। Landing page-এ documentation sidebar, table of contents, edit metadata, বা previous/next page switcher দেখানো হয় না।

Default home page content সরাতে root route-এ `home: false` দিন।

## স্লট

### `hero-image`

কাস্টম হিরো ইমেজ ব্যবহার, যেমন:

```svelte title="/src/routes/+page.(md|svelte)"
{#snippet heroImage()}
  <div>
  Custom hero image content
  </div>
{/snippet}
```
