---
title: Svelte in markdown
---

This feature allows you to write
`<style>`, `#if`, <code>&lt;script&gt;</code>, <code>&lt;script module&gt;</code> `#each`, `#await`, `#snippet`, `@render` `@html`, `@const`, `<svelte:xxx>`' in .md files

## Basic

Here's a basic example with `#if`, `#each`, `#await`, `@html`, `@const`

```md live no-ast
<script>
  let count = $state(0)
  const items = ['foo', 'bar', 'zoo']
  let boolVal = $state(false)

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

{@html "<h1>Content render with @html</h1>"}
```

:::note[Syntax Restrictions]{icon=solar:chat-square-code-outline}
Always use quotes in markdown files.
```md
<script>
  let count = $state(0)
</script>
<button onclick={() => count++}></button> // [svp! --]
<button onclick="{() => count++}"></button> // [svp! ++]
```
Or you can wrap it with a `div`

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

## A Counter

<Tabs activeName="Output">

<TabPanel name="Output">

> A counter

<div>
  <button onclick={() => count++} style="margin-bottom: 12px;">
    You've clicked {count} times
  </button>
</div>

</TabPanel>

<TabPanel name="Input">

```md
> A counter
<script>
  let count = $state(0)
</script>

<div>
  <button onclick={() => count++} style="margin-bottom: 12px;">
    You've clicked {count} times
  </button>
</div>
```

</TabPanel>

</Tabs>
