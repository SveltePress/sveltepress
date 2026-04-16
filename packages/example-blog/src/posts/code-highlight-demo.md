---
title: Code Highlighting Features Demo
date: 2026-04-16
tags: [demo, code]
category: Features
author: Demo Author
cover: https://picsum.photos/seed/code/800/400
---

# Code Highlighting Features

This post demonstrates all code block features available in the blog theme.

## Basic Syntax Highlighting

```ts
const greeting = 'Hello, Sveltepress!'
console.log(greeting)
```

## Code Block with Title

```ts title="vite.config.ts"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'

export default defineConfig({
  plugins: [sveltepress()],
})
```

## Line Numbers

```ts ln
const a = 1
const b = 2
const c = 3
const d = 4
const e = 5
```

## Title + Line Numbers

```ts title="app.ts" ln
import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000)
```

## Line Highlighting

```ts
const normal = 'not highlighted'
const important = 'this line is highlighted' // [svp! hl]
const alsoNormal = 'back to normal'
```

## Diff Commands

```ts
const oldValue = 'remove me' // [svp! --]
const newValue = 'add me' // [svp! ++]
const unchanged = 'stays the same'
```

## Focus Command

```ts
const unfocused1 = 'dim'
const focused = 'bright and clear' // [svp! fc]
const unfocused2 = 'dim again'
```

## Multiple Languages

```html
<div class="container">
  <h1>Hello</h1>
  <p>Welcome to Sveltepress</p>
</div>
```

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
```

```json
{
  "name": "my-blog",
  "version": "1.0.0",
  "type": "module"
}
```

## Svelte Component

```svelte
<script lang="ts">
  let count = $state(0)

  function increment() {
    count++
  }
</script>

<button onclick={increment}>
  Count: {count}
</button>
```

That covers all the code highlighting features!
