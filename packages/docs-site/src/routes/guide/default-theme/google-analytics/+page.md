---
title: Google Analytics
---

## Introduction 

pass `ga` to default theme to use Google Analytics

## Example config

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        ga: 'G-XXXXXXXXX' // [svp! ++]
      })
    })
  ],
})

```