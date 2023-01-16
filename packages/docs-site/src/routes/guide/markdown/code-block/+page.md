---
title:  Code Block
---

:::tip Tips
All the code block features are fully compatible with dark mode.  
Toggle dark mode to see the styles.
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
Use `// [svp! fc:num]` to focus num lines from current line

**Input**

:::caution Notice
Multi `// [svp! fc]` in one single code block is not supported
:::

````md
```html
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
<h1> // [svp! fc:3]
  this would be focus
</h1>
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
<h1> // [svp! fc:3]
  this would be focus
</h1>
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
```

### Svelte live code

use svelte lang and live prop would have effect like this

````md
```svelte live
<script>
  let count = 0

  const handleClick = () => {
    count++
  }
</script>
<button on:click={handleClick}>
  You've clicked {count} times
</button>
```
````

```svelte live
<script>
  let count = 0

  const handleClick = () => {
    count++
  }
</script>
<button on:click={handleClick}>
  You've clicked {count} times
</button>
<style>
  button {
    background-color: purple;
    color: white;
    outline: 0;
    border: 0;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```