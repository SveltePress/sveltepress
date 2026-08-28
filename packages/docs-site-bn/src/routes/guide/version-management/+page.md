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

## Current version-এ কী নতুন তা বর্ণনা করুন

SveltePress manifest-এর ক্রম অনুযায়ী current route inventory-কে সর্বশেষ historical version-এর সঙ্গে তুলনা করে। শুধু current version-এ থাকা route নতুন page হিসেবে তালিকাভুক্ত হয়। Summary যোগ করতে বা change catalog থেকে page বাদ দিতে frontmatter ব্যবহার করুন:

```yaml
---
title: নতুন কী
versionChanges:
  exclude: true
  summary: ঐচ্ছিক page summary
---
```

আগের Markdown page-এ গুরুত্বপূর্ণ নতুন section স্পষ্টভাবে চিহ্নিত করুন। Version, title এবং page-এর মধ্যে unique stable ID—তিনটিই আবশ্যক:

```md
:::since[Hot reload configuration]{version="8.2" id="hot-reload" summary="Restart লাগে না"}
নতুন documentation content।
:::
```

Unknown version, duplicate ID, unknown field বা ভুল type development server ও production build বন্ধ করে দেয়। নতুন page কেবল **New pages** group-এ যায়; তার `since` section আবার **Updated pages**-এ আসে না। প্রথম managed version-এর কোনো baseline নেই এবং পুরো site-কে নতুন ধরা হয় না।

Default Theme page ও section badge শুধু সেই version-এ দেখায় যেখানে content প্রথম এসেছে। Site নিজের পছন্দের route-এ overview component রাখতে পারে:

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

Component current version দিয়ে শুরু করে এবং historical selection-এর জন্য `?version={id}` ব্যবহার করে। Current link unprefixed থাকে; historical link `/v/{id}/...` ও নির্দিষ্ট section anchor-এ যায়।

Custom theme একই frozen data পড়তে পারে:

```ts
import { changeSets, resolveVersionChanges } from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` outgoing current change set-কে `.sveltepress-version.json`-এ freeze করে। Historical change পরের current docs থেকে পুনরায় হিসাব হয় না; `versions validate` marker, version reference, unique anchor এবং snapshot drift পরীক্ষা করে।
