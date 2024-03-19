---
title: 在 Markdown 中使用 Svelte
---

借助这个特性，您可以在 md 文件中使用
`<style>`，`<script>`， `<script context="module">`，`#if`, `#each`, `#await`, `@html`，`@const`，`<svelte:xxx>` 等 svelte 专属语法


## 基础使用

这是一个使用了 `#if`，`#each`，`#await`，`@html`，`@const` 的基础示例

<Tabs activeName="输出">
  <TabPanel name="输出">

<ul>
{#each items as item, i}
{@const str = `${i + 1}: ${item}`}
  <li>
    {str}
  </li>
{/each}
</ul>

<button on:click="{() => boolVal = !boolVal}">
Toggle
</button>

{#if boolVal}
  <h3 class="text-green">
    Pass
  </h3>
{:else}
  <h3 class="text-red">
    Fail
  </h3>
{/if}

{#await promise}
  <h3 class="text-orange">
    Loading
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

{@html "<h1>用 @html 渲染的内容</h1>"}

  </TabPanel>
  <TabPanel name="输入">

```md
<script>
  const items = ['foo', 'bar', 'zoo']
  let boolVal = false

  const promisePass = () => new Promise(resolve => {
    setTimeout(() => {
      resolve('Promise Passed!')
    }, 2000)
  })

  const promiseFail = () => new Promise((_, reject) => {
    setTimeout(() => {
      reject('Promise Failed!')
    }, 2000)
  })

  $: promise = boolVal ? promisePass() : promiseFail()
</script>

<ul>
{#each items as item, i}
{@const str = `${i + 1}: ${item}`}
  <li>
    {str}
  </li>
{/each}
</ul>

<button on:click="{() => boolVal = !boolVal}">
Toggle
</button>

{#if boolVal}
  <h3 class="text-green">
    Pass
  </h3>
{:else}
  <h3 class="text-red">
    Fail
  </h3>
{/if}

{#await promise}
  <h3 class="text-orange">
    Loading
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

{@html "<h1>用 @html 渲染的内容</h1>"}
```

  </TabPanel>
</Tabs>

## 一个简单的计数器

<Tabs activeName="输出">

  <TabPanel name="输出">

> 一个计数器

<button on:click="{() => count++}" style="margin-bottom: 12px;">
  您点击了 {count} 次
</button>

  </TabPanel>

  <TabPanel name="输入">

```md
> 一个计数器
<script>
  let count = 0
</script>

<button on:click="{() => count++}">
 您点击了 {count} 次
</button>
```

  </TabPanel>
</Tabs>

<script>
  import Counter from './Counter.svelte'
  let count = 0
  const items = ['foo', 'bar', 'zoo']
  let boolVal = false
  const promisePass = () => new Promise(resolve => {
    setTimeout(() => {
      resolve('Promise Passed!')
    }, 2000)
  })

  const promiseFail = () => new Promise((_, reject) => {
    setTimeout(() => {
      reject('Promise Failed!')
    }, 2000)
  })

  $: promise = boolVal ? promisePass() : promiseFail()
</script>


:::note[语法限制]{icon=solar:chat-square-code-outline}
确保总是使用双引号包裹
```svelte
<script>
  let count = 0
</script>
<button on:click={() => count++}></button> // [svp! --]
<button on:click="{() => count++}"></button> // [svp! ++]
```
:::

## 在 md 文件中导入 svelte 文件

<Tabs activeName="输出">
  <TabPanel name="输出">
  
<Counter />
  
  </TabPanel>
  <TabPanel name="输入">

```md
<script>
  import Counter from './Counter.svelte'
</script>
<Counter />
```

  </TabPanel>
  <TabPanel name="Counter.svelte">

@code(./Counter.svelte) 

  </TabPanel>
</Tabs>
