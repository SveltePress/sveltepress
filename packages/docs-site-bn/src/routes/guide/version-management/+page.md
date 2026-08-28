---
title: ডকুমেন্ট সংস্করণ ব্যবস্থাপনা
---

SveltePress সর্বশেষ ডকুমেন্টেশনকে স্বাভাবিক URL-এ রেখে `/v/8.1/`-এর মতো পথে অপরিবর্তনীয় পুরোনো snapshot প্রকাশ করতে পারে। এটি opt-in; `sveltepress.versions.json` না থাকলে সাইট আগের মতোই কাজ করে।

## ইনস্টল ও শুরু

```sh
pnpm add -D @sveltepress/cli
pnpm exec sveltepress versions init --current 8.1 --label "8.1"
```

Vite plugin স্বয়ংক্রিয়ভাবে manifest খুঁজে পায়। `sveltepress({ versions: false })` দিয়ে এটি বন্ধ করা যায়, অথবা `sveltepress({ versions: { manifest: 'path/to/versions.json' } })` দিয়ে অন্য manifest বেছে নেওয়া যায়।

## Release snapshot তৈরি

নতুন current version সরাসরি তৈরি করুন। CLI নিজেই সাইটের Vite ও Default Theme configuration resolve করে, তাই আগাম build ছাড়াই active sidebar freeze হয়:

```sh
pnpm exec sveltepress versions create 8.2 --label "8.2"
pnpm exec sveltepress versions validate
```

`create` নির্বাচিত route source `src/routes/v/8.1/`-এ কপি করে, route ও sidebar metadata freeze করে, `8.1`-কে history-তে রাখে এবং `8.2`-কে current করে। Duplicate ID, symbolic link, dirty Git worktree এবং frozen boundary-এর বাইরের dependency প্রত্যাখ্যাত হয়। Uncommitted state-ই release source হলে শুধু তখন `--allow-dirty` ব্যবহার করুন। ব্যর্থ preflight কোনো অসম্পূর্ণ snapshot বা manifest পরিবর্তন রেখে যায় না।

`versions list` সব version দেখায় এবং `versions validate` missing বা orphan snapshot directory পরীক্ষা করে।

## Manifest-এর মূল ক্ষেত্র

```json
{
  "$schema": "./node_modules/@sveltepress/cli/schema/versions.schema.json",
  "basePath": "/v",
  "current": { "id": "8.2", "label": "8.2" },
  "versions": [
    {
      "id": "8.1",
      "label": "8.1",
      "status": "deprecated",
      "sourceRef": "v8.1.0",
      "search": { "facetFilters": ["version:8.1"] }
    }
  ],
  "content": {
    "include": ["**"],
    "exclude": ["internal/**"],
    "shared": ["$lib/**", "static/**"]
  }
}
```

Version ID URL-safe lowercase হতে হবে; dot ও hyphen ব্যবহার করা যায়। `include` ও `exclude` কোন route file freeze হবে তা ঠিক করে। `shared` ইচ্ছাকৃত live dependency ঘোষণা করে; তালিকাটি ছোট রাখুন, কারণ ভবিষ্যৎ পরিবর্তন সব historical version-এ প্রভাব ফেলতে পারে।

`status`-এ `deprecated` বা `eol` দিলে lifecycle banner দেখা যায়। `sourceRef` historical edit link-কে সংশ্লিষ্ট Git ref-এ পাঠায়; `editLink: false` দিয়ে link লুকানো যায়। EOL version ডিফল্টভাবে `noindex` পায়।

## Navigation, search ও output

Default Theme নিজে থেকেই keyboard-accessible version selector যোগ করে। Historical internal link ও frozen sidebar একই version-এ থাকে। Version বদলালে একই logical page রাখা হয়; page না থাকলে সেই version-এর home page খুলে একটি notice দেখায়।

Historical search স্পষ্ট `search` configuration ছাড়া বন্ধ থাকে। Custom search component selected version ও metadata পায়; DocSearch configured facet filter ব্যবহার করে। এতে current result-কে ভুলভাবে historical result হিসেবে দেখানো হয় না।

Build প্রতিটি page-এর canonical, version-aware `sitemap.xml`, এবং `/v/{id}/llms.txt` তৈরি করে; root LLM file শুধু current docs রাখে। PWA historical HTML precache করে না এবং historical page-এর জন্য network-first strategy ব্যবহার করে। Custom theme `virtual:sveltepress/versions` থেকে manifest ও path resolver নিতে পারে।

Snapshot directory release artifact হিসেবে review ও commit করুন, হাতে edit করবেন না। Current route সংশোধন করে পরের snapshot তৈরি করুন।
