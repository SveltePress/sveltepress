---
title: আন্তর্জাতিকীকরণ (i18n)
---

SveltePress একই সাইটে একাধিক লোকেল পরিবেশন করতে পারে। আন্তর্জাতিকীকরণ opt-in: `locales` না দিলে সাইট single-locale থাকে এবং আগের আচরণই বজায় থাকে।

:::since[Opt-in locales]{version="2026-09-03" id="i18n-opt-in-locales" summary="Pass sveltepress({ locales }) to enable multi-locale routing, theme options, and switcher."}
## লোকেল সক্রিয় করুন

`sveltepress()`-এ একটি `locales` ম্যাপ দিন। কী হলো URL prefix (`'/'` ডিফল্ট লোকেলের জন্য, `'/zh/'`, `'/bn/'`, …)। প্রতিটি এন্ট্রিতে BCP 47 `lang`, ভাষা সুইচারের জন্য `label`, এবং সেই লোকেলের সম্পূর্ণ theme options থাকতে হবে:

```ts title="vite.config.ts"
// @noErrors
import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import { locales } from './config/locales'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        // সব লোকেলের shared সাইট-লেভেল অপশন
      }),
      locales,
    }),
  ],
})
```

`locales` না থাকলে SveltePress পাথ rewrite করে না, language switcher দেখায় না, এবং locale route tree স্ক্যান করে না।
:::

:::since[Locale routes and prefixes]{version="2026-09-03" id="i18n-route-prefixes" summary="Default locale stays at /; other locales live under /zh/, /bn/, and matching src/routes trees."}
## রুট ও prefix

অনুবাদ করা পৃষ্ঠাগুলো ডিফল্ট লোকেলের একই logical route ID-এর পাশে রাখুন (`src/routes/…`, `src/routes/zh/…`, `src/routes/bn/…`)। ডিফল্ট লোকেল unprefixed `/`-এ থাকে। Navbar, sidebar, হোম action বাটন এবং feature card লিংকেও সেই logical path ব্যবহার করুন (যেমন `/guide/introduction/`); Default Theme সক্রিয় লোকেলের prefix যোগ করবে।
:::

:::since[Language switcher and fallbacks]{version="2026-09-03" id="i18n-language-switcher" summary="Default Theme switcher preserves the logical page, including versioned fallbacks."}
## Language switcher ও fallback

`locales` কনফিগার থাকলে Default Theme navbar-এ language switcher দেখায়। ভাষা বদলালে documentation version, logical page, এবং in-view heading (`#hash`) একই থাকে। Historical version (`/v/<id>/…` বা `/zh/v/<id>/…`) থেকে সুইচ করলে টার্গেট লোকেলের একই frozen version-এ যায়; সেই পৃষ্ঠা না থাকলে current logical page, তারপর লোকেল home-এ fallback করে (`svp-locale-fallback=1`)।
:::

:::since[virtual:sveltepress/locale]{version="2026-09-03" id="i18n-virtual-locale" summary="Client helpers resolve the active locale, localize links, and compute switch targets."}
## `virtual:sveltepress/locale`

```ts
// @noErrors
import {
  locales,
  resolveLocale,
  resolveLocaleSwitch,
  resolveLocalizedPath,
} from 'virtual:sveltepress/locale'
```

* `locales` — কনফিগার করা ম্যাপ; i18n বন্ধ থাকলে `null`
* `resolveLocale` / `resolveLocalizedPath` / `resolveLocaleSwitch` — সক্রিয় লোকেল, লিঙ্ক rewrite, সুইচার টার্গেট
:::

:::since[createLocaleHandle]{version="2026-09-03" id="i18n-create-locale-handle" summary="SSR hook sets <html lang> from the active locale before hydration."}
## SSR `<html lang>`

```js title="src/hooks.server.js"
// @noErrors
import { createLocaleHandle } from '@sveltepress/vite/hooks'
import { locales } from '../config/locales'

export const handle = createLocaleHandle(locales)
```
:::

:::since[Per-locale llms and hreflang sitemap]{version="2026-09-03" id="i18n-llms-sitemap" summary="Each locale gets its own llms indexes; sitemap lists hreflang across locales and historical versions."}
## Per-locale llms ও sitemap

`llms` চালু থাকলে প্রতি লোকেলে আলাদা `llms.txt` / `llms-full.txt` লেখা হয়। `sitemap.xml` লোকেলগুলোর current page ও eligible historical version URL hreflang alternate-সহ তালিকাভুক্ত করে।
:::

:::since[Locale-aware versioning]{version="2026-09-03" id="i18n-locale-versioning" summary="Each locale has its own versions manifest; CLI --locale selects sveltepress.versions.<locale>.json."}
## Locale-aware versioning

নতুন ভাষা যোগ করতে SveltePress প্যাকেজ কোড বদলাতে হয় না। `locales`-এ প্রিফিক্স দিন, পেজ রাখুন `src/routes/<slug>/`-এ; ডকুমেন্ট ভার্সন ব্যবহার করলে `sveltepress versions init --locale <slug>` চালান। ভাষা পরিবর্তন, সাইডবার এবং ঐতিহাসিক URL সেই প্রিফিক্স অনুসরণ করে।

প্রতি লোকেলের আলাদা manifest থাকতে পারে: `/` → `sveltepress.versions.json` (`/v`), `/<slug>/` → `sveltepress.versions.<slug>.json` (`/<slug>/v`)। ডিফল্ট `sveltepress versions build` কনফিগার করা সব লোকেল draft করে এক output-এ compose করে। `init` / `create` / `validate` এবং এক-লোকেল draft-এ `--locale` দিন:

```sh
sveltepress versions build
sveltepress versions create 8.2 --label "8.2" --locale bn
sveltepress versions validate --locale bn
```

বিস্তারিত: [ডকুমেন্ট সংস্করণ ব্যবস্থাপনা](/guide/version-management/)।
:::

## লোকেল অনুযায়ী সার্চ

Local Search `<html lang="…">` অনুসরণ করে। DocSearch/custom search-এর জন্য প্রতি লোকেলে আলাদা theme options দিন। বিস্তারিত: [সার্চ](/guide/default-theme/search/)।
