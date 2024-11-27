---
title: Themes
---

## Introduction

Pass `theme` option to sveltepress to use a theme

Read [Vite plugin options](/reference/vite-plugin/) and [Default theme options](/reference/default-theme/) for more details

## Default theme

### Install

@install-pkg(@sveltepress/theme-default)

### Add in your vite config

```ts title="vite.config.(js|ts)"
import { defaultTheme } from '@sveltepress/theme-default' // [svp! ++]
import { sveltepress } from '@sveltepress/vite'

import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(/** theme options */) // [svp! ++]
    })
  ],
})

export default config
```

Get more info about default theme in [Default theme reference](/reference/default-theme/#Theme-Options)
