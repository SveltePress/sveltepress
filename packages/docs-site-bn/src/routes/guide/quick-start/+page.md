---
title: Quick Start
---

## Creating a project

Run one of the following command  
Depend on what package manager you are using

@install-pkg(@sveltepress,create)

:::tip[PNPM first]
Use pnpm as much as possible. It respects package version more than npm.
:::

## Adding to an existing sveltekit project

### Install vite plugin package

@install-pkg(@sveltepress/vite)

### Replace `sveltekit` plugin in vite.config.(js|ts)

```ts title="vite.config.(js|ts)"
// @noErrors
import { defineConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]

import { sveltepress } from '@sveltepress/vite' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltekit(), // [svp! --]
    sveltepress(), // [svp! ++]
  ],
})

export default config
```

### Add `'.md'` extension to the `extensions` options in your svelte.config.js

```ts title="svelte.config.js"
// @noErrors
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte'], // [svp! --]
  extensions: ['.svelte', '.md'], // add .md here // [svp! ++]
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
```
