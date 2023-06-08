---
title: Unocss
---

## Introduction

The default theme use the [Unocss](https://github.com/unocss/unocss) to implement all styles

Let's have some examples to see the benefits:

## Easily dark mode

The following content would show 3 red cards per line in light mode.  
And 2 blue cards per line in dark mode.   
Isn't this great with few codes?

```svelte live
<div class="grid grid-cols-3 gap-4 dark:grid-cols-2">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
<style>
  .card {
    --at-apply: h-[100px] flex items-center justify-center
      rounded bg-rose-5 dark:bg-blue-5;
  }
</style>
```

## Easily multi screen compatible

Toggle the window size or use different device to ses what's happening

```svelte live
<div class="sm:text-5 sm:text-rose-5 text-blue-5 text-10">
  This is a text with different font size and color in wide or narrow width device
</div>
```

## Easily pure css icons

```svelte live
<div class="text-[56px]">
  <div class="i-openmoji-red-apple"></div>
  <div class="i-openmoji-banana"></div>
  <div class="i-openmoji-grapes"></div>
</div>
```

## And more...

Use your talents, ideas to achieve more!