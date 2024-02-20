---
title: Twoslash
---

This feature integrate [Twoslash](https://github.com/twoslashes/twoslash)

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