---
title: Quick Start
---

## Create a project

Run one of the following command  
Depend on what package manager you are using

```sh
# via npm
npm create @sveltepress

# via yarn
yarn create @sveltepress

# vai pnpm
pnpm create @sveltepress
```

## Add to an existing sveltekit project

### Install vite plugin package
```sh
# via npm
npm install --save @sveltepress/vite

# via yarn
yarn add @sveltepress/vite

# vai pnpm
pnpm install @sveltepress/vite
```

### Replace `sveltekit` plugin in vite.config.(js|ts)

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit' // [svp! --]
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

```js title="svelte.config.js"
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'

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
