---
title:  Code related
---

:::tip[Dark Mode Compatible]{icon=mdi:theme-light-dark}
All the code block features are fully compatible with dark mode.  
Toggle dark mode to see the styles.
:::

## Code highlight

This feature integrate [Shiki](https://github.com/shikijs/shiki)

````md live
```svelte
<script>
  const msg = 'world!'
</script>

<h1>
  Hello, {msg}
</h1>
```
````

You can customize the supported languages and theme in light/dark mode. More info reference to [Default theme reference - highlight option](/reference/default-theme/#highlight)

## Code title

````md live
```svelte title="HelloWorld.svelte"
<script>
  const msg = 'world!'
</script>

<h1>
  Hello, {msg}
</h1>
```
````

## Line numbers

Add `ln` in code block meta field would add line numbers in the rendered result.

````md live
```svelte ln
<script>
  const msg = 'world!'
</script>

<h1>
  Hello, {msg}
</h1>
```
````

## Line highlight

Use `// [svp! hl]` `// [svp! ~~]`  to highlight the line you want  
Use `// [svp! hl:num]` or `// [svp! ~~:num]` to highlight the num lines from the current line you want

````md live
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

## Diff

Use `// [svp! df:+]` or `// [svp! ++]` for diff add  
Use `// [svp! df:-]` or `// [svp! --]` for diff subtract

````md live
```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:+]

function hello() {
  console.log('Hello', msg) // [svp! --]
  console.log('Hello', newMsg) // [svp! ++]
}
```
````

## Focus

Use `// [svp! fc]` or `// [svp! !!]` to focus line  
Use `// [svp! fc:num]` or `// [svp! !!:num]` to focus num lines from current line

:::warning[Not Supported]
Multi `// [svp! fc]` in one single code block is not supported
:::

````md live
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

## Markdown live code

Use md lang and live prop would render the result and the markdown source codes under the result.

**Input**

`````md
````md live
### Title
* item1
* item2
```js
const foo = 'bar'
```
````
`````
**Output**

````md live
### Title
* item1
* item2
```js
const foo = 'bar'
```
````

## Svelte live code

Use svelte lang and live prop would render the result and the source codes under the result.

**Input**

````md
```svelte live ln title=Counter.svelte
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

```svelte live ln title=Counter.svelte
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

## Async svelte live code

The js file that render the demo part would be bundled into a single js file and load async in the page

**Input**

````md
```svelte live async
<h1>This is an async svelte live code</h1>
```
````

**Output**

```svelte live async
<h1>This is an async svelte live code</h1>
```

:::warning[Live code in live code is not supported]
The nested live code block below would be rendered as normal highlight code block.
`````md live
````md
```md live
### Title
```
````
`````
:::

## Combine features

You can use more than one features mentioned above: 

````md live
```js ln title="complex-example.js"
function hello() {
  const oldMsg = 'Some msg with focus, diff --' // [svp! --] // [svp! !!:3]
  const newMsg1 = 'Some msg with both focus, diff ++, highlight line' // [svp! ++] // [svp! ~~]
  const newMsg2 = 'Some msg with both focus, diff ++' // [svp! ++]
}
```
````

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

:::tip[Tip]{icon=solar:chat-square-code-outline}
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