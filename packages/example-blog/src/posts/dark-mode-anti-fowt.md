---
title: Dark Mode Without Flash of Wrong Theme
date: 2026-04-05
tags: [css, dark-mode, web]
category: Web Design
author: Demo Author
cover: https://picsum.photos/seed/darkmode/800/400
---

# Dark Mode Without Flash of Wrong Theme

Flash of wrong theme (FOWT) happens when the page renders in the default palette before your JavaScript applies the user's preference. The fix is to set the theme **before** the body paints.

## The Inline Script Pattern

Inject a synchronous `<script>` in `<head>` that runs before any CSS parses:

```html
<head>
  <script>
    (function(){
      var stored = localStorage.getItem('theme')
      var preferred = matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light'
      document.documentElement.dataset.theme = stored || preferred
    })()
  </script>
  <!-- rest of head -->
</head>
```

## Why It Works

Browsers block rendering on synchronous scripts in `<head>`, so the `data-theme` attribute is set before any CSS with `[data-theme="dark"]` selectors is evaluated. No flash.

## Don't Defer

Never use `async` or `defer` on this script — it must run synchronously to beat first paint.
