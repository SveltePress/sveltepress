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
Use `// [svp! hl:num]` to highlight the num lines from the current line you want

**Input**

````md
```svelte
<script>
  const msg = 'world!' // [svp! hl]

  function hello() {
    const foo = 'bar' // [svp! hl:2]
    const bar = foo

    return foo
  }
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

  function hello() {
    const foo = 'bar' // [svp! hl:2]
    const bar = foo

    return foo
  }
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

## Focus

Use `// [svp! fc]` to focus line

**Input**

````md
```html
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
<h1>this would be focus</h1> // [svp! fc]
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
```
````

**Output**

```html
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
<h1>this would be focus</h1> // [svp! fc]
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
```