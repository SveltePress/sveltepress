---
title: 'virtual:sveltepress/locale'
versionChanges:
  exclude: true
---

When multi-locale support is enabled in `@sveltepress/vite` via `locales`, `virtual:sveltepress/locale` exposes the resolved locale configurations, route locale detection, localized link helpers, and language switch resolution.

Custom themes and components can import this module to build language switchers, localized navigation links, and locale-aware UI chrome.

## Live data

Here is an interactive inspection of the `locales` configuration on this site:

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

## Module exports

### `locales`

* **Type**: `LocalesConfig | null`

The multi-locale configuration dictionary keyed by route prefix (`'/'`, `'/zh/'`, `'/bn/'`, etc.). Returns `null` on a single-locale site where `locales` is omitted.

### `resolveLocale`

* **Type**: `(pathname: string, base?: string) => ResolvedLocale | null`

Resolves the active `ResolvedLocale` object for a URL pathname, containing:
* `prefix`: The route prefix (such as `'/'`, `'/zh/'`, or `'/bn/'`).
* `lang`: The BCP 47 language tag (e.g. `'en'`, `'zh-CN'`, `'bn'`).
* `label`: User-facing label (e.g. `'English'`, `'简体中文'`, `'বাংলা'`).
* `title`: Optional site title override for this locale.
* `description`: Optional site description override for this locale.
* `theme`: Theme options specific to this locale.

### `resolveLocalizedPath`

* **Type**: `(to: string, locale: ResolvedLocale | null, base?: string) => string`

Prepends the given locale's prefix to an internal link pathname if the target does not already have it. Returns external and unlocalized links unchanged.

### `resolveLocaleSwitch`

* **Type**: `(pathname: string, targetPrefix: string, base?: string) => LocaleSwitchTarget | null`

Calculates the destination URL and fallback state when switching language from `pathname` to `targetPrefix`. Returns `{ href, fallback }`, where `fallback` is `true` if the page does not exist in the target language and falls back to that language's home route.

### `default`

* **Type**: `LocaleRuntime`

The default export is the locale runtime object itself, bundling `locales`, `resolveLocale`, `resolveLocalizedPath`, and `resolveLocaleSwitch`.

## Working with TypeScript

Include `@sveltepress/vite/types` in your `src/app.d.ts` to get full type tips for `virtual:sveltepress/locale`:

```ts title="/src/app.d.ts"
/// <reference types="@sveltepress/vite/types" />

// Your other types
```
