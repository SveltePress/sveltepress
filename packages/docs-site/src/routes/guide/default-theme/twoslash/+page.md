---
title: Twoslash
---

This feature integrate [Twoslash](https://github.com/twoslashes/twoslash)

All of the Typescript code blocks would provide inline type hover.

## Enable twoslash

* Install @sveltepress/twoslash package

@install-pkg(@sveltepress/twoslash)

* Config `highlighter.twoslash` to `true`
```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        highlighter: { // [svp! ++]
          twoslash: true // [svp! ++]
        } // [svp! ++]
      })
    })
  ]
})
```

## Basic type annotation

````md live
```ts
const foo = false

const obj = {
  a: 'a',
  b: 1
}
```
````

## Errors

````md live
```ts
// @errors: 2304 2322
const foo: Foo = null

const a: number = '1'
```
````

## Queries

````md live
```ts
const hi = 'Hello'
const msg = `${hi}, world`
//    ^?

//
//
Number.parseInt('123', 10)
//      ^|
//
//
//
//
```
````

## Custom logs

````md live
```ts
// @log: Custom log message
const a = 1

// @error: Custom error message
const b = 1

// @warn: Custom warning message
const c = 1

// @annotate: Custom annotation message
```
````

## Cut codes

### cut before

use `// ---cut---` or `// ---cut-before---` can cut all codes before this line

````md live
```ts
const level: string = 'Danger'
// ---cut---
console.log(level)
```
````

### cut after

use `// ---cut-after---` can cut all codes after this line

````md live
```ts
const level: string = 'Danger'
// ---cut-before---
console.log(level)
// ---cut-after---
console.log('This is not shown')
```
````

### cut start/end

use `// ---cut-start---` and `// ---cut-end---` to cut contents between them

````md live
```ts
const level: string = 'Danger'
// ---cut-start---
console.log(level) // This is not shown.
// ---cut-end---
console.log('This is shown')
```
````

## Twoslash for svelte

```svelte
<script>
  import { onMount } from 'svelte'

  let count = 0

  onMount(() => {
    console.log('mount')
  })
</script>
<button on:click="{count++}">
  Count is: { count }
</button>
```