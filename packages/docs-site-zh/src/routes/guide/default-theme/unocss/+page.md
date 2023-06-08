---
title: Unocss
---

## 介绍

默认主题集成了 [Unocss](https://github.com/unocss/unocss) 来实现所有的样式

让我们来看几个例子来体会便利性

## 日间/夜间模式切换

下面的内容在日间模式下每行会展示 3 个红色卡片，而在夜间模式下每行会展示 2 个蓝色卡片，并且没有编写任何的 CSS 代码，您可以切换模式来观察效果

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

## 无 CSS 媒体查询

下面的内容在宽屏下会展示玫瑰色小号字体，而在窄屏幕下会展示蓝色大号字体，您可以切换窗口大小来观察结果

```svelte live
<div class="sm:text-5 sm:text-rose-5 text-blue-5 text-10">
  This is a text with different font size and color in wide or narrow width device
</div>
```

## 纯 CSS 图标

```svelte live
<div class="text-[56px]">
  <div class="i-openmoji-red-apple"></div>
  <div class="i-openmoji-banana"></div>
  <div class="i-openmoji-grapes"></div>
</div>
```

## 还有更多

发挥你的想象力来解锁更多玩法