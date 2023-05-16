---
title: 在 Markdown 中使用 Svelte
---

借助这个特性，您可以在 md 文件中使用
`<style>`, `<script>` 以及 `<script context="module">`


## 简单示例

**输入**

```md
> 一个计数器
<script>
  let count = 0
</script>

<button on:click="{() => count++}">
 您点击了 {count} 次
</button>
```

**输出**

> 一个计数器

<script>
  import Counter from './Counter.svelte'
  let count = 0
</script>

<button on:click="{() => count++}" style="margin-bottom: 12px;">
  您点击了 {count} 次
</button>

:::note[语法限制]
确保总是使用双引号包裹
```svelte
  <button on:click={() => count++}></button> // [svp! --]
  <button on:click="{() => count++}"></button> // [svp! ++]
```
:::

## 在 md 文件中导入 svelte 文件

**Counter.svelte**

@code(./Counter.svelte) 

**Input**

```md
<script>
  import Counter from './Counter.svelte'
</script>
<Counter />
```

**Output**

<Counter />

