---
title: PWA
---

## Introduction

This feature integrated [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin)

Pass `pwa` option to theme default to use pwa. The options are exactly the same as [SvelteKit PWA Plugin Options](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html#sveltekit-pwa-plugin-options) except for `darkManifest`, which is the manifest path that would used for dark theme

And the svelte.config.js need to config `files.serviceWorker`, use the `SERVICE_WORKER_PATH` exported from `@sveltepress/theme-default`

```ts title="svelte.config.js"
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static'

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


## Example config

Take the config this site use for example:

@code(/config/pwa.ts)