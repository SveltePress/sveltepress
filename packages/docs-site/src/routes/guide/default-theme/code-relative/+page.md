---
title:  Code relative
---

:::tip Tips
All the code block features are fully compatible with dark mode.  
Toggle dark mode to see the styles.
:::

## Code highlight

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

## Line highlight

Use `// [svp! hl]` `// [svp! ~~]`  to highlight the line you want  
Use `// [svp! hl:num]` or `// [svp! ~~:num]` to highlight the num lines from the current line you want

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
  Hello, {msg}  // [svp! ~~]
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
  Hello, {msg} // [svp! ~~]
</h1>
```

## Diff

Use `// [svp! df:+]` or `// [svp! ++]` for diff add  
Use `// [svp! df:-]` or `// [svp! --]` for diff subtract

**Input**

````md
```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:+]

function hello() {
  console.log('Hello', msg) // [svp! --]
  console.log('Hello', newMsg) // [svp! ++]
}
```
````

**Output**

```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:+]

function hello() {
  console.log('Hello', msg) // [svp! --]
  console.log('Hello', newMsg) // [svp! ++]
}
```

## Focus

Use `// [svp! fc]` or `// [svp! !!]` to focus line  
Use `// [svp! fc:num]` or `// [svp! !!:num]` to focus num lines from current line

**Input**

:::warning Not Supported
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
<h1> // [svp! !!:3]
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
<h1> // [svp! !!:3]
  this would be focus
</h1>
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
```

## Svelte live code

use svelte lang and live prop would have effect like this

**Input**

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
````

**Output**

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

## Import code

This feature can allow you to import some code directly from a file.  
And use the file extension name as `lang` to highlight the code.
And you can specify the startLine and endLine to intercept the code you want.

```md
@code(/path/to/file[,startLine[,endLine]])
```
Path can starts with `.` or `/`
* `.` is the relative path to the current md file
* `/` is the relative path to project root, where you start the `vite` command

For example you have file tree like this

```txt
├─ src
│  ├─ routes
│  │  ├─ foo
│  │  │  ├─ +page.md
│  │  │  ├─ Foo.svelte
```

* `@code(./Foo.svelte)` - import all code from Foo.svelte
* `@code(/src/routes/foo/Foo.svelte)` - import all code from Foo.svelte
* `@code(./Foo.svelte,5,10)` - import the line 10 to line 20 in Foo.svelte
* `@code(/src/routes/foo/Foo.svelte,10,20)` - import the line 10 to line 20 in Foo.svelte

:::tip Tip
Notice that start line and end line both would be included in the final content.
:::

## Cheat list

| Alias    | Equals   | Function                             |
| -------- | -------- | ------------------------------------ |
| `~~`     | `hl`     | highlight single line                |
| `~~:num` | `hl:num` | highlight num line from current line |
| `++`     | `df:+`   | diff add line                        |
| `--`     | `df:-`   | diff subtract line                   |
| `!!`     | `fc`     | focus single line                    |
| `!!:num` | `fc:num` | focus num line from current line     |