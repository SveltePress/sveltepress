---
title: Sveltepress CLI
versionChanges:
  exclude: true
---

`@sveltepress/cli` প্যাকেজটি ডকুমেন্ট সংস্করণ, ম্যানিফেস্ট, অপরিবর্তনীয় সোর্স ডেল্টা এবং ইনক্রিমেন্টাল বিল্ড আর্টিফ্যাক্ট পরিচালনার জন্য `sveltepress` কমান্ড লাইন টুল সরবরাহ করে।

## ইনস্টলেশন

```sh
pnpm add -D @sveltepress/cli
```

## কমান্ড সিনট্যাক্স

```sh
sveltepress versions <command> [options]
```

## সাব-কমান্ডসমূহ

### `init`

নতুন সংস্করণ ম্যানিফেস্ট ফাইল (`sveltepress.versions.json`) তৈরি করুন:

```sh
sveltepress versions init --current 1.0 --label "1.0"
```

* `--current <id>`: বর্তমান সংস্করণের শনাক্তকারী। আবশ্যক।
* `--label <label>`: বর্তমান সংস্করণের প্রদর্শন লেবেল (ডিফল্ট: শনাক্তকারী নিজেই)।
* `--base-path <path>`: ঐতিহাসিক রুটের মূল প্রিফিক্স (ডিফল্ট: `'/v'`; `--locale` দিলে `'/<locale>/v'`)।
* `--locale <id>`: লক্ষ্য লোকাল (যেমন `zh`, `bn`)। এটি `sveltepress.versions.<locale>.json` তৈরি করে।

### `create`

এখনকার বর্তমান সংস্করণটি ফ্রিজ করুন এবং একটি নতুন বর্তমান সংস্করণ শুরু করুন:

```sh
sveltepress versions create 1.1 --label "1.1"
```

ধরুন `1.0` বর্তমান সংস্করণ: এই কমান্ড `1.0`-কে তার বিদ্যমান শনাক্তকারী ও লেবেলসহ অপরিবর্তনীয় ঐতিহাসিক সংস্করণ হিসেবে ফ্রিজ করে এবং `1.1`-কে নতুন বর্তমান সংস্করণ বানায়।

* `<version-id>`: **নতুন বর্তমান** সংস্করণের শনাক্তকারী। এটি আগে থেকে থাকা চলবে না।
* `--label <label>`: নতুন বর্তমান সংস্করণের প্রদর্শন লেবেল (ডিফল্ট: `<version-id>`)।
* `--locale <id>`: শুধুমাত্র নির্দিষ্ট লোকাল ম্যানিফেস্ট ফ্রিজ করুন।
* `--allow-dirty`: আনকমিটেড গিট পরিবর্তন থাকা সত্ত্বেও রিলিজ তৈরি করার অনুমতি দেয়।

### `list`

নিবন্ধিত সমস্ত ডকুমেন্ট সংস্করণ এবং তাদের স্ট্যাটাস প্রদর্শন করুন:

```sh
sveltepress versions list
sveltepress versions list --locale bn
```

* `--locale <id>`: লক্ষ্য লোকাল।

### `validate`

ম্যানিফেস্ট ফরম্যাট, পরিবর্তন তালিকা, আর্টিফ্যাক্ট এবং ডেল্টার নির্ভুলতা পরীক্ষা করুন:

```sh
sveltepress versions validate
sveltepress versions validate --locale bn
```

* `--locale <id>`: লক্ষ্য লোকাল।

:::since[শুধু বর্তমান tree-এ Vite]{version="2026-09-17" id="versions-cli-overlay-plan" summary="versions plan overlay সংখ্যা দেখায়; versions build বর্তমান tree prerender করে তারপর frozen /v/ HTML overlay করে।"}
`versions plan` JSON-এ `vitePrerenderScope: "current-only"` ও `overlaidHistoricalHtml` থাকে। `--locale` ছাড়া `versions build` শুধু বর্তমান locale tree prerender করে, তারপর frozen `/v/` HTML একই output-এ overlay করে।
:::

### `plan`

ইনক্রিমেন্টাল বিল্ড প্ল্যান প্রিভিউ করুন: page reuse, পরিবর্তিত route, overlay সংখ্যা এবং invalidation। JSON-এ `vitePrerenderScope: "current-only"` ও `overlaidHistoricalHtml` থাকে।

```sh
sveltepress versions plan
```

* `--locale <id>`: লক্ষ্য লোকাল।

### `build`

সংস্করণ-সচেতন প্রোডাকশন কম্পাইলেশন চালান। `--locale` ছাড়া এটি সব লোকাল draft করে, Vite শুধু বর্তমান tree চালায়, তারপর frozen `/v/` HTML একই output-এ overlay করে:

```sh
sveltepress versions build
sveltepress versions build --locale bn
```

* `--locale <id>`: শুধুমাত্র নির্দিষ্ট লোকাল বিল্ড করুন।
* `--draft-only`: চূড়ান্ত কম্পোজিশন ছাড়া ড্রাফট আর্টিফ্যাক্ট তৈরি করুন।

### `compose`

পূর্বে তৈরি করা পেজ আর্টিফ্যাক্টগুলোকে চূড়ান্ত আউটপুট ডিরেক্টরিতে একত্রিত করুন:

```sh
sveltepress versions compose
```

* `--locale <id>`: লক্ষ্য লোকাল।

### `publish`

ইতিমধ্যে ফ্রিজ করা একটি সংস্করণের পরিচয় প্রিন্ট করুন, যেমন CI জবে রেকর্ড করার জন্য। এটি শুধু আর্টিফ্যাক্ট স্টোর পড়ে, কিছুই পরিবর্তন করে না:

```sh
sveltepress versions publish 1.0
```

আউটপুট একটি JSON, যাতে `siteId`, `versionId`, `manifestHash` এবং পেজের সংখ্যা `pages` থাকে।

* `<version-id>`: ম্যানিফেস্টের একটি ফ্রিজ করা সংস্করণ।
* `--locale <id>`: লক্ষ্য লোকাল।

:::note[লাইফসাইকেল স্ট্যাটাস]
ফ্রিজ করা সংস্করণের `status` বা `message` বদলানোর কোনো সাব-কমান্ড এখনো নেই। ম্যানিফেস্ট এখন কী গ্রহণ করে তা জানতে [ভার্সন ম্যানেজমেন্ট](/guide/version-management/) দেখুন।
:::

### `migrate`

পুরাতন সংস্করণ মেটাডেটাকে কনটেন্ট-অ্যাড্রেসড ইনক্রিমেন্টাল স্টোরে স্থানান্তর করুন:

```sh
sveltepress versions migrate --site-id my-docs
```

* `--site-id <id>`: আর্টিফ্যাক্ট স্টোরের শনাক্তকারী।
* `--store <dir>`: কাস্টম আর্টিফ্যাক্ট স্টোর ডিরেক্টরি।
* `--locale <id>`: লক্ষ্য লোকাল।

### `gc`

স্থানীয় স্টোর থেকে অব্যবহৃত বা মুছে ফেলা ঐতিহাসিক পেজ আর্টিফ্যাক্টগুলো মুছে জায়গা খালি করুন:

```sh
sveltepress versions gc --dry-run
sveltepress versions gc
```

* `--dry-run`: কিছু না মুছে শুধু জানায় কতগুলো আর্টিফ্যাক্ট মোছা হবে।
* `--locale <id>`: লক্ষ্য লোকাল।
