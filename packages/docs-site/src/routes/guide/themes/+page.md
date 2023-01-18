---
title: Themes
---

## Introduction

Pass `theme` option to sveltepress to use a theme

Read [Vite plugin options](/reference/vite-plugin-options/) and [Default theme options](/reference/default-theme-options/) for more details

## Default theme

### Install

```sh
# via npm
npm install --save @svelte-press/theme-default

# via yarn
yarn add @svelte-press/theme-default

# via pnpm
pnpm install @svelte-press/theme-default
```

### Add in your vite config

```js
// vite.config.(js|ts)
import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

Your get more info about default in [Default theme features](/reference/default-theme/#Theme%20features)