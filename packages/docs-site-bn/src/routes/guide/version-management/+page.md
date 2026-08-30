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

## Incremental artifact চালু করুন

Existing site-এর committed পূর্ণ snapshot একবার migrate করুন। New site-এ `versions init`-এর পর একই command চালানো যায়:

```sh
pnpm exec sveltepress versions migrate --site-id docs-example
```

Migration পূর্ণ `src/routes/v/{id}` copy-কে committed `version-deltas/{id}` source delta দিয়ে বদলে দেয় এবং `.sveltepress/version-artifacts`-এ content-addressed page store তৈরি করে। Store-টি build cache; source delta commit করুন এবং CI-তে artifact store restore/cache করুন।

Production build script:

```json
{
  "scripts": {
    "build": "sveltepress versions build"
  }
}
```

`versions plan` build না করেই compiled, reused, removed ও recomposed route জানায়। `versions build` committed delta থেকে missing history restore করে, current version-এর শুধু বদলানো page compile করে, stable SveltePress shell-এ সব route compose করে, তারপর স্বাভাবিক Vite production build চালায়। Shell বা index বদলালে page content পুনরায় compile না করেও route recompose হতে পারে; page compiler বা artifact schema বদলালে সব page artifact ইচ্ছাকৃতভাবে invalid হয়।

GitHub Actions-এ build-এর আগে সর্বশেষ compatible store restore করুন এবং current commit key-তে updated store save করুন:

```yaml
- uses: actions/cache@v4
  with:
    path: .sveltepress/version-artifacts
    key: sveltepress-pages-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      sveltepress-pages-${{ runner.os }}-
- run: pnpm build
```

অন্য CI provider-এ সমতুল্য persistent cache ব্যবহার করুন। আলাদা `siteId`-এর মধ্যে একই store share করবেন না।

Default Theme-এর LiveCode component-সহ generated page module তার নিজস্ব page artifact-এর মধ্যে রাখা হয়। CI-তে শুধু `.sveltepress/version-artifacts` cache করলেই যথেষ্ট; `.sveltepress/live-code` local development-এর temporary directory এবং reused page restore করতে এটি প্রয়োজন হয় না।

## Release snapshot তৈরি

Manifest এগোনোর আগে outgoing current version build করুন:

```sh
pnpm exec sveltepress versions build
pnpm exec sveltepress versions create 8.2 --label "8.2"
pnpm exec sveltepress versions validate
```

`create` current draft manifest publish করে, কেবল বদলানো page ও tombstone `version-deltas/8.1/`-এ লেখে, route/sidebar/change metadata freeze করে, `8.1`-কে history-তে রাখে এবং `8.2`-কে current করে। Stale draft, duplicate ID, symbolic link, dirty Git worktree এবং frozen boundary-এর বাইরের dependency প্রত্যাখ্যাত হয়। Uncommitted state-ই release source হলে শুধু তখন `--allow-dirty` ব্যবহার করুন। Failed preflight কোনো অসম্পূর্ণ delta বা manifest change রেখে যায় না।

Published version-এ generated `sourceHash` লেখা হয় এবং প্রতিটি delta metadata hash দিয়ে frozen route, sidebar ও change catalog bind করে। `versions validate` প্রতিটি committed delta reconstruct করে দুই hash-ই পরীক্ষা করে, তাই artifact cache খালি থাকলেও source বা metadata drift ধরা পড়ে। Hash বা delta file হাতে edit করবেন না।

`versions list` version order দেখায়, `versions publish 8.1` CI publication-এর immutable manifest hash দেয়, এবং `versions gc --dry-run` cleanup-এর আগে unreferenced local blob দেখায়।

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
  },
  "artifacts": {
    "mode": "incremental",
    "siteId": "docs-example",
    "store": ".sveltepress/version-artifacts",
    "sources": "version-deltas"
  }
}
```

Version ID URL-safe lowercase হতে হবে; dot ও hyphen ব্যবহার করা যায়। `include` ও `exclude` কোন route file freeze হবে তা ঠিক করে। `shared` ইচ্ছাকৃত live dependency ঘোষণা করে; তালিকাটি ছোট রাখুন, কারণ ভবিষ্যৎ পরিবর্তন সব historical version-এ প্রভাব ফেলতে পারে।

`status`-এ `deprecated` বা `eol` দিলে navigation-এর উপরে একটি স্পষ্ট site-wide পুরোনো-version banner দেখা যায়। এটি পুরোনো site-এর কিছু feature কাজ নাও করতে পারে বলে জানায় এবং একই logical page-এর current version-এ link দেয়। `sourceRef` historical edit link-কে সংশ্লিষ্ট Git ref-এ পাঠায়; `editLink: false` দিয়ে link লুকানো যায়। EOL version ডিফল্টভাবে `noindex` পায়।

## Navigation, search ও output

Default Theme নিজে থেকেই keyboard-accessible version selector যোগ করে। Historical internal link ও frozen sidebar একই version-এ থাকে। Version বদলালে একই logical page রাখা হয়; page না থাকলে সেই version-এর home page খুলে একটি notice দেখায়।

Historical search স্পষ্ট `search` configuration ছাড়া বন্ধ থাকে। Custom search component selected version ও metadata পায়; DocSearch configured facet filter ব্যবহার করে। এতে current result-কে ভুলভাবে historical result হিসেবে দেখানো হয় না।

Build প্রতিটি page-এর canonical, version-aware `sitemap.xml`, এবং `/v/{id}/llms.txt` তৈরি করে; root LLM file শুধু current docs রাখে। PWA historical HTML precache করে না এবং historical page-এর জন্য network-first strategy ব্যবহার করে। Custom theme `virtual:sveltepress/versions` থেকে manifest ও path resolver নিতে পারে।

Browser code-এ package থেকে এই resolver-গুলো সরাসরি import করলে `@sveltepress/vite/versioning/runtime` ব্যবহার করুন; এই entry-তে Node file-system code নেই। Build ও configuration code-এ `@sveltepress/vite/versioning` ব্যবহার করা যাবে।

`version-deltas` immutable release source হিসেবে review ও commit করুন, হাতে edit করবেন না। Cold CI এগুলো থেকে artifact restore করতে পারে; persistent CI cache historical page পুনরায় compile করা এড়ায়। Current route সংশোধন করে পরের release delta তৈরি করুন।

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

Sidebar নতুন ও updated page-এর পাশে compact **New** badge দেখায়। **On this page** কেবল `:::since` দিয়ে স্পষ্টভাবে চিহ্নিত section-এ একই badge দেখায়। Compact text বদলাতে `i18n.versionNavigationNewLabel` ব্যবহার করুন।

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

এই site-এর route উদাহরণ [নতুন কী page](/whats-new/)-এ দেখা যাবে।

Component current version দিয়ে শুরু করে এবং historical selection-এর জন্য `?version={id}` ব্যবহার করে। Current link unprefixed থাকে; historical link `/v/{id}/...` ও নির্দিষ্ট section anchor-এ যায়।

Custom theme একই frozen data পড়তে পারে:

```ts
import { changeSets, resolveVersionChanges } from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` outgoing current change set-কে immutable artifact manifest ও source delta-তে freeze করে। Historical change পরের current docs থেকে পুনরায় হিসাব হয় না; `versions validate` marker, version reference, unique anchor, corrupt artifact এবং delta drift পরীক্ষা করে।
