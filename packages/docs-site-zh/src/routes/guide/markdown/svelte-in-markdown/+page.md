---
title: Svelte in markdown
---

This feature allows you to write
`<style>`, `#if`, <code>&lt;script&gt;</code>, <code>&lt;script module&gt;</code> `#each`, `#await`, `#snippet`, `@render` `@html`, `@const`, `<svelte:xxx>`' in .md files

## Basic

这里是一个使用了 `#if`, `#each`, `#await`, `@html`, `@const` 的基础示例

```md live no-ast
<script>
  let count = $state(0)
  const items = ['foo', 'bar', 'zoo']
  let boolVal = $state(false)

  const promisePass = () => new Promise(resolve => {
    setTimeout(() => {
      resolve('Promise 通过!')
    }, 2000)
  })

  const promiseFail = () => new Promise((_, reject) => {
    setTimeout(() => {
      reject('Promise 未通过!')
    }, 2000)
  })

  let promise = $derived(boolVal ? promisePass() : promiseFail())
</script>

<ul>
{#each items as item, i}
{@const str = `${i + 1}: ${item}`}
  <li>
    {str}
  </li>
{/each}
</ul>

<button onclick="{() => boolVal = !boolVal}">
切换
</button>

{#if boolVal}
  <h3 class="text-green">
    通过
  </h3>
{:else}
  <h3 class="text-red">
    失败
  </h3>
{/if}

{#await promise}
  <h3 class="text-orange">
    加载中
  </h3>
{:then res}
  <h3 class="text-green">
    {res}
  </h3>
{:catch err}
  <h3 class="text-red">
    {err}
  </h3>
{/await}

{@html "<h1>使用 @html 渲染的内容</h1>"}
```

:::note[语法限制]{icon=solar:chat-square-code-outline}
始终使用 "" 包裹语法.
```md
<script>
  let count = $state(0)
</script>
<button onclick={() => count++}></button> // [svp! --]
<button onclick="{() => count++}"></button> // [svp! ++]
```
或者也可以使用一个空的 `div` 包裹

```md
<script>
  let count = $state(0)
</script>
<button onclick={() => count++}></button> // [svp! --]
<div> // [svp! ++]
  <button onclick={() => count++}></button> // [svp! ++]
</div> // [svp! ++]
```
:::

## 一个计数器示例

<Tabs activeName="输出">

<TabPanel name="输出">

> 一个计数器

<div>
  <button onclick={() => count++} style="margin-bottom: 12px;">
    已点击次数： {count}
  </button>
</div>

</TabPanel>

<TabPanel name="输入">

```md
> 一个计数器
<script>
  let count = $state(0)
</script>

<div>
  <button onclick={() => count++} style="margin-bottom: 12px;">
    已点击次数： {count}
  </button>
</div>
```

</TabPanel>

</Tabs>
