---
title:  Code Block
---

:::tip Woo
All the code block features are fully compatible with dark mode.
:::

## Code Highlight

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

rendered

```svelte
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```

## Line Highlight

````md
```svelte
<script>
  const msg = 'world!' // [svp! hl]
</script>
  
<h1>
  Hello, {msg}
</h1>
```
````

rendered

```svelte
<script>
  const msg = 'world!' // [svp! hl]
</script>
  
<h1>
  Hello, {msg}
</h1>
```