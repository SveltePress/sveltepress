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

## LiveCode artifact স্ব-পরীক্ষা

এই পৃষ্ঠাটি সেই আচরণ সরাসরি ব্যবহার করে। নিচের interactive component-টি এই Markdown file থেকে তৈরি হয়ে page artifact-এ সংরক্ষিত হয়। Local `.sveltepress/live-code` directory মুছে ফেলার পরও reused artifact build-এ এটি server-render হয়। Card-টি দেখা গেলে এবং button-টি কাজ করলে reusable artifact ও client hydration—দুই পথই সঠিকভাবে চলছে।

```svelte live
<script>
  let interactions = $state(0)
  const checks = [
    'Generated module অন্তর্ভুক্ত',
    'Server render সম্পন্ন',
    'Client hydration প্রস্তুত',
  ]
</script>

<section class="artifact-check" data-version-artifact-live-code>
  <div class="artifact-check__status" aria-hidden="true">✓</div>
  <div class="artifact-check__content">
    <p class="artifact-check__eyebrow">লাইভ ডকুমেন্টেশন পরীক্ষা</p>
    <h3>Artifact স্ব-পরীক্ষা সফল</h3>
    <ul>
      {#each checks as check}
        <li><span aria-hidden="true">✓</span>{check}</li>
      {/each}
    </ul>
    <button type="button" onclick={() => interactions++}>
      Interaction পরীক্ষা করুন{interactions ? ` · ${interactions}` : ''}
    </button>
  </div>
</section>

<style>
  .artifact-check {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    overflow: hidden;
    padding: 1.25rem;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    border-radius: 1rem;
    background:
      radial-gradient(circle at 100% 0%, rgb(255 94 122 / 18%), transparent 45%),
      color-mix(in srgb, currentColor 4%, transparent);
  }

  .artifact-check__status {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border-radius: 0.85rem;
    color: #14231a;
    font-size: 1.4rem;
    font-weight: 800;
    background: #70e19b;
    box-shadow: 0 0 0 0.35rem rgb(112 225 155 / 12%);
  }

  .artifact-check__content h3,
  .artifact-check__content p {
    margin: 0;
  }

  .artifact-check__eyebrow {
    color: #ff5e7a;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .artifact-check__content h3 {
    margin-top: 0.15rem;
    font-size: 1.2rem;
  }

  .artifact-check__content ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.85rem 0;
    padding: 0;
    list-style: none;
  }

  .artifact-check__content li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    font-size: 0.78rem;
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .artifact-check__content li span {
    color: #45c97c;
    font-weight: 800;
  }

  .artifact-check__content button {
    padding: 0.55rem 0.8rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 0.65rem;
    color: inherit;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    background: transparent;
    cursor: pointer;
  }

  .artifact-check__content button:hover {
    border-color: #ff5e7a;
  }
</style>
```

## Release snapshot তৈরি

:::since[নতুন current version-এর documentation workflow]{version="2026-08-31" id="next-version-doc-workflow" summary="Outgoing docs freeze করার পর নতুন current docs edit ও since marker যোগ করুন।"}
পরবর্তী documentation version শুরু করতে outgoing docs clean ও সম্পূর্ণ থাকা অবস্থায় প্রথমে `versions build`, তারপর `versions create <new-current-id>` চালান। `create` outgoing current version-কে freeze করে নতুন ID-কে current করে। কেবল এরপর নতুন current docs edit করুন এবং সেই current ID দিয়ে `:::since` marker যোগ করুন; শেষে আবার `versions build` ও `versions validate` চালান।

```sh
pnpm exec sveltepress versions build
pnpm exec sveltepress versions create 8.2 --label "8.2"

# 8.2 এখন current: docs edit করুন এবং version="8.2" marker যোগ করুন

pnpm exec sveltepress versions build
pnpm exec sveltepress versions validate
```

আগেই edit করা next-version docs-এর ওপর কখনও `versions create` চালাবেন না। এতে edit-গুলো নতুন current version-এর পরিবর্তে outgoing version-এর মধ্যে freeze হয়ে যাবে। Edit ইতিমধ্যে থাকলে clean outgoing state ফিরিয়ে এনে create/advance করুন, তারপর edit-গুলো নতুন current version-এ পুনরায় প্রয়োগ করুন।
:::

:::since[CLI --locale for per-locale manifests]{version="2026-09-03" id="versions-cli-locale" summary="Pass --locale to target sveltepress.versions.<locale>.json for zh, bn, and other locales."}
Multi-locale site-এ প্রতি লোকেলের আলাদা versions manifest থাকে। `init`, `create`, `validate` ইত্যাদি versions subcommand-এ `--locale <id>` দিন। `--locale` ছাড়া `sveltepress versions build` সব লোকেল draft করে `/v/`, `/zh/v/`, `/bn/v/` একসাথে production output-এ compose করে।

```sh
sveltepress versions build --locale bn
sveltepress versions create 8.2 --label "8.2" --locale bn
sveltepress versions validate --locale bn
```

বিস্তারিত: [আন্তর্জাতিকীকরণ](/guide/i18n/)।
:::

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

:::since[Historical Local Search vs DocSearch]{version="2026-09-03" id="version-historical-pagefind-search" summary="Pagefind historical indexes freeze on version release; DocSearch still needs search metadata."}
Built-in **Local Search** (Pagefind) historical version-এ কাজ করে: production build `syncHistoricalPagefind` দিয়ে প্রতি version-এর Pagefind asset freeze করে, আর theme `/v/{id}/pagefind/` (বা locale-prefixed সমতুল্য) লোড করে। Local Search-এর জন্য version-এ `search` object লাগে না।

**DocSearch** ও custom `search` component-এর জন্য সেই historical version-এ স্পষ্ট `search` object লাগে। না থাকলে navbar জানায় search unavailable, যাতে current remote result historical বলে ভুল না হয়।
:::

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
### Hot reload

আগের documentation content।

:::since[Hot reload configuration]{version="8.2" id="hot-reload" summary="Restart লাগে না"}
নতুন documentation content।
:::
```

Unknown version, duplicate ID, unknown field বা ভুল type development server ও production build বন্ধ করে দেয়। নতুন page কেবল **New pages** group-এ যায়; তার `since` section আবার **Updated pages**-এ আসে না। প্রথম managed version-এর কোনো baseline নেই এবং পুরো site-কে নতুন ধরা হয় না।

Default Theme page ও section badge শুধু সেই version-এ দেখায় যেখানে content প্রথম এসেছে। Site নিজের পছন্দের route-এ overview component রাখতে পারে:

Sidebar নতুন ও updated page-এর পাশে compact **New** badge দেখায়। কোনো `:::since` marker-এর নিজের heading না থাকলে Default Theme একই Markdown container-এর নিকটতম আগের heading-এর সঙ্গে marker-টি স্বয়ংক্রিয়ভাবে যুক্ত করে এবং **On this page**-এ একই badge দেখায়। Marker-এর ভেতরের heading সরাসরি যুক্ত হয়। একই heading-এর সঙ্গে একাধিক marker যুক্ত থাকতে পারে; active version যেকোনো একটির সঙ্গে মিললে মাত্র একটি badge render হয়। Compact text বদলাতে `i18n.versionNavigationNewLabel` ব্যবহার করুন।

```svelte title="src/routes/whats-new/+page.svelte"
<script>
  import VersionChanges from '@sveltepress/theme-default/VersionChanges.svelte'
</script>

<VersionChanges />
```

এই site-এর route উদাহরণ [নতুন কী page](/whats-new/)-এ দেখা যাবে।

:::since[Route অনুযায়ী আলাদা নতুন কী catalog]{version="2026-08-31" id="version-scoped-whats-new" summary="প্রতিটি নতুন কী route-কে তার আগের version-এর তুলনায় freeze করা নিজস্ব change set-এর সঙ্গে যুক্ত রাখুন।"}
`VersionChanges` default হিসেবে current page URL থেকে resolve করা documentation version ব্যবহার করে; valid `?version={id}` সেই context-কে স্পষ্টভাবে override করতে পারে। প্রতিটি version-এর catalog manifest order-এ তার ঠিক আগের version-এর সঙ্গে তুলনা করে তৈরি হয়, আর frozen historical catalog পরবর্তী current documentation থেকে স্বাধীন থাকে। Current link unprefixed থাকে; historical link `/v/{id}/...` ও নির্দিষ্ট section anchor-এ যায়।
:::

Custom theme একই frozen data পড়তে পারে:

```ts
import { changeSets, resolveVersionChanges } from 'virtual:sveltepress/versions'

const currentChanges = resolveVersionChanges()
const historicalChanges = resolveVersionChanges('8.1')
```

`versions create` outgoing current change set-কে immutable artifact manifest ও source delta-তে freeze করে। Historical change পরের current docs থেকে পুনরায় হিসাব হয় না; `versions validate` marker, version reference, unique anchor, corrupt artifact এবং delta drift পরীক্ষা করে।
