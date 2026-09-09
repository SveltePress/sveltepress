---
title: Internationalization (i18n)
---

SveltePress can serve multiple locales from one site. Internationalization is opt-in: omit `locales` and the site stays single-locale with unchanged behavior.

:::since[Opt-in locales]{version="2026-09-03" id="i18n-opt-in-locales" summary="Pass sveltepress({ locales }) to enable multi-locale routing, theme options, and switcher."}
## Enable locales

Pass a `locales` map to `sveltepress()`. Keys are URL prefixes (`'/'` for the default locale, `'/zh/'`, `'/bn/'`, …). Each entry needs a BCP 47 `lang`, a user-facing `label` for the language switcher, and that locale's full theme options:

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
        // Site-wide options shared by every locale (logo, github, pwa, ...)
      }),
      locales,
    }),
  ],
})
```

```ts title="config/locales.ts"
// @noErrors
import type { LocalesConfig } from '@sveltepress/vite'
import navbar from './navbar'
import sidebar from './sidebar'
import zhI18n from './zh/i18n'
import zhNavbar from './zh/navbar'
import zhSidebar from './zh/sidebar'

export const locales: LocalesConfig = {
  '/': {
    lang: 'en',
    label: 'English',
    theme: { navbar, sidebar },
  },
  '/zh/': {
    lang: 'zh',
    label: '中文',
    theme: {
      navbar: zhNavbar,
      sidebar: zhSidebar,
      i18n: zhI18n,
    },
  },
}
```

Without `locales`, SveltePress does not rewrite paths, emit a language switcher, or scan locale route trees.
:::

:::since[Locale routes and prefixes]{version="2026-09-03" id="i18n-route-prefixes" summary="Default locale stays at /; other locales live under /zh/, /bn/, and matching src/routes trees."}
## Routes and prefixes

Place translated pages beside the default locale under matching route IDs:

```txt
src/routes/
├─ guide/introduction/+page.md          # English → /guide/introduction/
├─ zh/guide/introduction/+page.md       # Chinese → /zh/guide/introduction/
└─ bn/guide/introduction/+page.md       # Bengali → /bn/guide/introduction/
```

The default locale stays unprefixed at `/`. Other locales use their configured prefixes (`/zh/`, `/bn/`, …). Logical paths are the same across locales; only the prefix changes. Navbar, sidebar, home action, and feature-card links should use those logical paths (for example `/guide/introduction/`); the Default Theme prefixes them with the active locale.
:::

:::since[Language switcher and fallbacks]{version="2026-09-03" id="i18n-language-switcher" summary="Default Theme switcher keeps the documentation version, logical page, and heading hash."}
## Language switcher and fallbacks

When `locales` is configured, the Default Theme renders a language switcher in the navbar. Switching locales keeps the same documentation version, the same logical page, and the in-view heading (`#hash`). On a historical version page (`/v/<id>/…` or `/zh/v/<id>/…`), the switcher prefers the same frozen version in the target locale. Only if that frozen page is missing does it fall back to the current version of the same logical page, then to that locale's home with a short notice (`svp-locale-fallback=1`).

Customize switcher and notice copy with theme `i18n.localeSwitcher` and `i18n.localePageUnavailable`.
:::

:::since[virtual:sveltepress/locale]{version="2026-09-03" id="i18n-virtual-locale" summary="Client helpers resolve the active locale, localize links, and compute switch targets."}
## `virtual:sveltepress/locale`

Themes and custom layouts can import locale helpers from the virtual module:

```ts
// @noErrors
import {
  locales,
  resolveLocale,
  resolveLocaleSwitch,
  resolveLocalizedPath,
} from 'virtual:sveltepress/locale'

const active = resolveLocale('/zh/guide/introduction/')
const href = resolveLocalizedPath('/guide/quick-start/', active)
const target = resolveLocaleSwitch('/zh/guide/introduction/', '/')
```

* `locales` — the configured map, or `null` when i18n is off
* `resolveLocale(pathname)` — active locale (`lang`, `label`, `prefix`, `theme`, …)
* `resolveLocalizedPath(to, locale)` — rewrite an internal link into the active locale
* `resolveLocaleSwitch(pathname, targetPrefix)` — `{ href, fallback }` for the switcher
:::

:::since[createLocaleHandle]{version="2026-09-03" id="i18n-create-locale-handle" summary="SSR hook sets <html lang> from the active locale before hydration."}
## SSR `<html lang>`

Use `createLocaleHandle` from `@sveltepress/vite/hooks` so the initial HTML carries the correct language for crawlers and assistive technology. The Default Theme keeps `document.documentElement.lang` in sync after client-side navigation.

```js title="src/hooks.server.js"
// @noErrors
import { createLocaleHandle } from '@sveltepress/vite/hooks'
import { locales } from '../config/locales'

export const handle = createLocaleHandle(locales)
```
:::

:::since[Per-locale llms and hreflang sitemap]{version="2026-09-03" id="i18n-llms-sitemap" summary="Each locale gets its own llms indexes; sitemap lists hreflang across locales and historical versions."}
## Per-locale llms and sitemap

With `llms` enabled, production builds write locale-scoped `llms.txt` / `llms-full.txt` (for example `/llms.txt` and `/zh/llms.txt`), listing only that locale's pages with prefixed URLs. Historical indexes land under each locale's version base (`/v/<id>/`, `/zh/v/<id>/`, …).

`sitemap.xml` lists every locale's current pages with hreflang alternates for locales that share the logical route, plus eligible historical version URLs from each locale manifest. EOL history is excluded unless a version opts out with `noIndex: false`.
:::

:::since[Locale-aware versioning]{version="2026-09-03" id="i18n-locale-versioning" summary="Each locale has its own versions manifest; CLI --locale selects sveltepress.versions.<locale>.json."}
## Locale-aware versioning

Adding a locale does not require changes to SveltePress packages. Configure the prefix in `locales`, put pages under `src/routes/<slug>/`, and if you use document versions run `sveltepress versions init --locale <slug>`. Language switching, sidebar localization, and historical URLs follow that prefix automatically.

Each locale can keep its own document-version manifest:

| Locale prefix | Manifest | Version base |
| --- | --- | --- |
| `/` (default) | `sveltepress.versions.json` | `/v` |
| `/<slug>/` (for example `/zh/`, `/bn/`, `/ja/`) | `sveltepress.versions.<slug>.json` | `/<slug>/v` |

A default `sveltepress versions build` drafts every configured locale and composes each locale's `/v/` tree into one output. Pass `--locale` to `init`, `create`, `validate`, and single-locale draft jobs:

```sh
pnpm exec sveltepress versions build
pnpm exec sveltepress versions create 8.2 --label "8.2" --locale zh
pnpm exec sveltepress versions validate --locale zh
```

`versions init --locale zh` creates `sveltepress.versions.zh.json` with base path `/zh/v` by default. Incremental deltas live in `version-deltas-zh/` (or the manifest's `artifacts.sources`). See [Document version management](/guide/version-management/) for the full release workflow.
:::

## Search per locale

Local Search indexes respect `<html lang="…">`. DocSearch and custom search should use per-locale theme options (separate indexes). Details and version-aware behavior: [Search](/guide/default-theme/search/).
