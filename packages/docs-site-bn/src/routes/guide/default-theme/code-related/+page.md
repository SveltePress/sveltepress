---
title: কোড সম্পর্কিত
---

:::tip[ডার্ক মোড কম্পাটিবল]{icon=mdi:theme-light-dark}
সকল কোড ব্লক ফিচার ডার্ক মোডের সাথে পুরোপুরি কম্পাটিবল।
স্টাইল দেখার জন্য ডার্ক মোড ব্যবহার করুন।
:::

## কোড হাইলাইট

এই ফিচারটি [Shiki](https://github.com/shikijs/shiki) সমন্বয় করেছে।

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

আপনি সাপোর্টেড ল্যাঙ্গুয়েজ এবং লাইট/ডার্ক মোডের জন্য থিম কাস্টমাইজ করতে পারবেন। আরো বিস্তারিতে জানতে [ডিফল্ট থিম রেফারেন্স - হাইলাইট অপশন](/reference/default-theme/#highlighter)

## কোড টাইটেল

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

## লাইন নম্বর

কোড ব্লকের মেটা ফিল্ডে `ln` যুক্ত করার দ্বার লাইন নম্বর প্রদর্শন করানো যাবে।

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

## লাইন হাইলাইট

যে লাইনটি হাইলাইট করতে চান সেটাতে `// [svp! hl]` `// [svp! ~~]` ব্যবহার করুন
একাধিক লাইন হাইলাইট করতে `// [svp! hl:num]` or `// [svp! ~~:num]` ব্যবহার করুন।

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

## পার্থক্য

নতুন লাইন যুক্ত করা দেখাতে `// [svp! df:+]` or `// [svp! ++]`
লাইন বিয়োগ করা দেখাতে `// [svp! df:-]` or `// [svp! --]`

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

## ফোকাস

লাইন ফোকাস করতে `// [svp! fc]` or `// [svp! !!]` ব্যবহার করুন।
একাধিক লাইন ফোকাস করতে `// [svp! fc:num]` or `// [svp! !!:num]` ব্যবহার করুন।

:::warning[সাপোর্ট করবে না]
এক কোড ব্লকে একাধিক `// [svp! fc]` সাপোর্ট করবে না।
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

## Markdown লাইভ কোড

md lang এবং live prop ব্যবহার করলে কোডের রেজাল্ট এবং তার নিচে Markdown এর সোর্স কোড দেখাবে।

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

## Svelte লাইভ কোড

svelte lang এবং live prop ব্যবহার করলে কোডের রেজাল্ট এবং তার নিচে সোর্স কোড দেখাবে।

**Input**

````md
```svelte live ln title=Counter.svelte
<script>
  let count = $state(0)

  const handleClick = () => {
    count++
  }
</script>
<button onclick={handleClick}>
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
  let count = $state(0)

  const handleClick = () => {
    count++
  }
</script>
<button onclick={handleClick}>
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

## Async svelte লাইভ কোড

ডেমোর অংশ রেন্ডার করে যে js ফাইল, সেটা একক js ফাইলে বান্ডল হবে এবং অ্যাসিঙ্ক্রোনাসলি পেজে লোড হবে।

**Input**

````md
```svelte live async
<h1>This is an async svelte live code</h1>
```
````

**Output**

```svelte live async
<h1>এটি একটি async svelte লাইভ কোড</h1>
```

:::warning[লাইভ কোডের ভিতরে লাইভ কোড সাপোর্ট করবে না]
নিচের নেস্টেড লাইভ কোড ব্লক সাধারণ হাইলাইট কোড ব্লক হিসেবে রেন্ডার হবে।
`````md live
````md
```md live
### Title
```
````
`````
:::

## একাধিক ফিচার একত্রিত করা

আপনি উল্লেখিত একাধিক ফিচার একসাথে ব্যবহার করতে পারবেনঃ

````md live
```js ln title="complex-example.js"
function hello() {
  const oldMsg = 'Some msg with focus, diff --' // [svp! --] // [svp! !!:3]
  const newMsg1 = 'Some msg with both focus, diff ++, highlight line' // [svp! ++] // [svp! ~~]
  const newMsg2 = 'Some msg with both focus, diff ++' // [svp! ++]
}
```
````

## কোড ইমপোর্ট

এই ফিচারটি আপনাকে সরাসরি কোনো ফাইল থেকে কোড ইমপোর্ট করার সুযোগ দেয়।
এবং কোড হাইলাইট করতে ফাইল এক্সটেনশন .lang ব্যবহার করুন।
আপনি শুরুর লাইন এবং শেষ লাইন নির্দিষ্ট করতে পারবেন আপনার কোডের নির্ধারিত অংশ নেয়ার জন্য।

```md
@code(/path/to/file[,startLine[,endLine]])
```
পাথ শুরু হবে `.` বা `/` দিয়ে
* `.` হচ্ছে বর্তমান md ফাইলের রিলেটিভ পাথ
* `/` হচ্ছে প্রজেক্টের রুটের রিলেটিভ পাথ, যেখানে আপনি `vite` কমান্ড চালান।

উদাহরণস্বরুপ, আপনার ফাইল ট্রি এমন হলে

```txt
├─ src
│  ├─ routes
│  │  ├─ foo
│  │  │  ├─ +page.md
│  │  │  ├─ Foo.svelte
```

* `@code(./Foo.svelte)` - Foo.svelte থেকে সকল কোড ইমপোর্ট করা
* `@code(/src/routes/foo/Foo.svelte)` - Foo.svelte থেকে সকল কোড ইমপোর্ট করা
* `@code(./Foo.svelte,5,10)` - Foo.svelte এর ৫ম থেকে ১০তম লাইন ইমপোর্ট করা
* `@code(/src/routes/foo/Foo.svelte,10,20)` - Foo.svelte এর ১০ম থেকে ২০তম লাইন ইমপোর্ট করা

:::tip[টিপ]{icon=solar:chat-square-code-outline}
লক্ষ্য করুন, ফাইন কন্টেন্টে শুরুর লাইন এবং শেষ লাইন উভয়টিই দেখাবে।
:::

## চিট লিস্ট

| সংক্ষিপ্ত রূপ | যার বিকল্প  | ফাংশন                               |
| -------- | -------- | ------------------------------------ |
| `~~`     | `hl`     | এক লাইন হাইলাইট করা                   |
| `~~:num` | `hl:num` | একটি নির্দিষ্ট লাইন থেকে বর্তমান লাইন হাইলাইট করা |
| `++`     | `df:+`   | লাইন যুক্ত করার ফলে সৃষ্ট পার্থক্য দেখানো      |
| `--`     | `df:-`   | লাইন বিয়োগ করার ফলে সৃষ্ট পার্থক্য দেখানো    |
| `!!`     | `fc`     | এক লাইন ফোকাস করা                    |
| `!!:num` | `fc:num` | কটি নির্দিষ্ট লাইন থেকে বর্তমান লাইন ফোকাস করা |
