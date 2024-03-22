---
title: Twoslash
---

该功能集成了 [Twoslash](https://github.com/twoslashes/twoslash)

所有的 Typescript 代码块将会自动添加鼠标上浮的类型提示

## 开启 twoslash

* 安装 @sveltepress/twoslash 依赖

@install-pkg(@sveltepress/twoslash)

* 将默认主题 `highlighter.twoslash` 选项设置为 `true`
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

## 基础类型注释

````md live
```ts
const foo = false

const obj = {
  a: 'a',
  b: 1
}
```
````

## TS 编译错误

````md live
```ts
// @errors: 2304 2322
const foo: Foo = null

const a: number = '1'
```
````

## 类型查询

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

## 自定义代码内提示

````md live
```ts
// @log: 自定义信息
const a = 1

// @error: 自定义信息
const b = 1

// @warn: 自定义信息
const c = 1

// @annotate: 自定义信息
```
````

## 代码裁剪

### 向前裁剪

使用 `// ---cut---` or `// ---cut-before---` 注释可以将该行之前的所有代码从结果中裁剪调

````md live
```ts
const level: string = 'Danger'
// ---cut---
console.log(level)
```
````


### 向后裁剪

使用 `// ---cut-after---` 注释可以将该行之后的所有代码从结果中裁剪调

````md live
```ts
const level: string = 'Danger'
// ---cut-before---
console.log(level)
// ---cut-after---
console.log('This is not shown')
```
````

### 自定义裁剪段落

使用 `// ---cut-start---` 与 `// ---cut-end---` 注释可以指定裁剪这两个注释之间的所有代码

````md live
```ts
const level: string = 'Danger'
// ---cut-start---
console.log(level) // This is not shown.
// ---cut-end---
console.log('This is shown')
```
````

## 支持 svelte 代码块

```svelte
<script>
  import { onMount } from 'svelte'

  let count = 0

  onMount(() => {
    console.log('mount')
  })
</script>
<button on:click="{count++}">
  您点击了: { count } 次
</button>
```