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
```js
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const focusCode = 'this would be focus' // [svp! fc]
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
```
````

**Output**

```js
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const focusCode = 'this would be focus' // [svp! fc]
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
const blurCode = 'this would be blur'
```