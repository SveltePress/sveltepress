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

**Input**

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

**Output**

```svelte
<script>
  const msg = 'world!' // [svp! hl]
</script>
  
<h1>
  Hello, {msg}
</h1>
```