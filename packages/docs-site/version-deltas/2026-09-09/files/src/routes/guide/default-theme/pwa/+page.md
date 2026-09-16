---
title: PWA
---

## Introduction

This feature integrated [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin)

Pass `pwa` option to theme default to use pwa. The options are exactly the same as [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) except for `darkManifest`, which is the manifest path that would used for dark theme

And the svelte.config.js need to config `files.serviceWorker`, use the `SERVICE_WORKER_PATH` exported from `@sveltepress/theme-default`

```ts title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { SERVICE_WORKER_PATH } from '@sveltepress/theme-default' // [svp! ++]

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    files: { // [svp! ++]
      serviceWorker: SERVICE_WORKER_PATH, // [svp! ++]
    }, // [svp! ++]
  },
}

export default config
```

:::note[package required]{icon=noto:package}
If you want to enable pwa.
You will need to add `workbox-window` as a dev dependency to your Vite project.
:::

## Precache (versions & i18n)

By default Sveltepress only precaches the **app shell** and the **homepage HTML**. The shell is SvelteKit’s entry modules, hashed CSS / fonts, and root icons — not per-route `_app/immutable/nodes` or shared chunks. Other documentation pages and those hashed modules are cached at runtime when the user visits them (pages: `NetworkFirst`, capped at 50 entries; hashed client files: `CacheFirst`, capped at 400 entries / 30 days). Images and SvelteKit `__data.json` responses are also runtime-cached.

This keeps service worker install and update fast when the site has many pages, versions, and locales, so the refresh prompt can appear soon after a deploy. Precaching every prerendered HTML file or every client module makes Workbox hash, compare and download `versions × locales × pages` on every update.

On first install, homepage hydration may need the network until those hashed modules have been runtime-cached. After one online visit, visited pages (including home) stay available offline through the runtime cache.

### `pwa.precachePages`

| Value | Precached HTML |
| --- | --- |
| `false` (default) | Homepage only |
| `true` | All prerendered HTML (historical versions are still ignored) |
| `string[]` | Homepage + matching URL prefixes |

Precache only the current locale and a version snapshot:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precachePages: ['/zh/', '/v/2026-08-27/'],
  },
})
```

Restore the previous “cache every page” behavior:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precachePages: true,
  },
})
```

:::tip
A glob starting with `prerendered/` is always included. Otherwise `@vite-pwa/sveltekit` would append `prerendered/**/*.{html,json}` and pull every version/locale page back into the precache.
:::

Visited pages still work offline through the runtime cache, even when they are not precached.

:::since[App-shell client precache]{version="2026-09-09" id="pwa-precache-client" summary="Default client precache is the app shell; precacheClient restores the catch-all glob."}

### `pwa.precacheClient`

| Value | Precached client files |
| --- | --- |
| `false` (default) | App shell only (entry + CSS / fonts + root icons) |
| `true` | Every matching client file |

Restore the previous “precache every client JS/CSS module” behavior:

```ts
import { defaultTheme } from '@sveltepress/theme-default'

defaultTheme({
  pwa: {
    precacheClient: true,
  },
})
```

`precachePages` and `precacheClient` are independent: HTML policy does not change the client glob, and the other way around.
:::

## Example config

Take the config this site use for example:

@code(/config/pwa.ts)
