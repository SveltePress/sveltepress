---
title: Google Analytics
---

## Introduction 

Pass `ga` to default theme to use Google Analytics.  
Value is the id provided by [Google Analytics](https://analytics.google.com/analytics/web/).  
Something like `G-XXXXXXXXX`.  
Would auto config gtag script in site head if provided.  

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