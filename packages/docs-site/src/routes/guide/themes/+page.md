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
npm install --save @sveltepress/theme-default

# via yarn
yarn add @sveltepress/theme-default

# via pnpm
pnpm install @sveltepress/theme-default
```

### Add in your vite config

```js title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

Get more info about default theme in [Default theme reference](/reference/default-theme/#Theme%20features)