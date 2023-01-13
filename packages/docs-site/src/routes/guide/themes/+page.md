---
title: Themes
---

## Introduction

Pass `theme` to sveltepress to use a theme

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
import { defaultTheme } from '@svelte-press/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */)
    })
  ],
})

export default config
```

