---
title: Twoslash
---

该功能集成了 [Twoslash](https://github.com/twoslashes/twoslash)

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
```
````