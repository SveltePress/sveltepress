---
title:  Code Block
---

:::tip Woo
All the code block features are fully compatible with dark mode.
:::

## Code Highlight

**Input**

````md
```svelte
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```
````

**Output**

```svelte
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```

## Line Highlight

Use `// [svp! hl]`  to highlight the line you want

**Input**

````md
```svelte
<script>
  const msg = 'world!' // [svp! hl]
</script>
  
<h1>
  Hello, {msg}  // [svp! hl]
</h1>
```
````

**Output**

```svelte
<script>
  const msg = 'world!' // [svp! hl]
</script>
  
<h1>
  Hello, {msg} // [svp! hl]
</h1>
```

## Diff

Use `// [svp! df:+]` and `// [svp! df:-]` for diffs

**Input**

````md
```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:-]
```
````

**Output**

```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:+]
```