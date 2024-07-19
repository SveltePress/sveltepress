---
title: Twoslash
---

এই ফিচারটি [Twoslash](https://github.com/twoslashes/twoslash) থেকে নেয়া। 

সব টাইপস্ক্রিপ্ট কোড ব্লক inline type hover প্রোভাইড করে। 

## twoslash চালু করা

* @sveltepress/twoslash প্যাকেজ ইন্সটল করুন

@install-pkg(@sveltepress/twoslash)

* `highlighter.twoslash` কনফিগ করে `true` করে দিন
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

## প্রাথমিক type annotation

````md live
```ts
const foo = false

const obj = {
  a: 'a',
  b: 1
}
```
````

## এরোর

````md live
```ts
// @errors: 2304 2322
const foo: Foo = null

const a: number = '1'
```
````

## কুয়েরি

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

## কাস্টম লগ

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

## কাট কোডস

### আগে কাট

`// ---cut---` বা `// ---cut-before---` ব্যবহার করে এই লাইনের পূর্বের সকল কোড কাট করা যাবে। 

````md live
```ts
const level: string = 'Danger'
// ---cut---
console.log(level)
```
````

### পরে কাট

`// ---cut-after---` বহার করে এই লাইনের পরের সকল কোড কাট করা যাবে। 

````md live
```ts
const level: string = 'Danger'
// ---cut-before---
console.log(level)
// ---cut-after---
console.log('This is not shown')
```
````

### কাট শুরু/শেষ

আইটেমের মাঝের কন্টেন্ট কাট করতে `// ---cut-start---` বা `// ---cut-end---`  ব্যবহার করুন 

````md live
```ts
const level: string = 'Danger'
// ---cut-start---
console.log(level) // This is not shown.
// ---cut-end---
console.log('This is shown')
```
````

## svelte এর জন্য Twoslash 

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