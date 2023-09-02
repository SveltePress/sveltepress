---
title: Svelte in markdown
---

This feature allows you to write 
`<style>`, `<script>`, `<script context="module">`, `#if`, `#each`, `#await`, `@html`, `@const`, `<svelte:xxx>` in .md files

## Basic

Here's a basic example with `#if`, `#each`, `#await`, `@html`, `@const`

**Input**

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

{@html "<h1>Content render with @html</h1>"}
```

**Output**

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

{@html "<h1>Content render with @html</h1>"}

:::note[Syntax Restrictions]{icon=solar:chat-square-code-outline}
Always use quotes in markdown files.
```svelte
  <button on:click={() => count++}></button> // [svp! --]
  <button on:click="{() => count++}"></button> // [svp! ++]
```
:::


## A Counter

**Input**

```md
> A counter
<script>
  let count = 0
</script>

<button on:click="{() => count++}">
  You've clicked {count} times
</button>
```

**Output**

> A counter

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

<button on:click="{() => count++}" style="margin-bottom: 12px;">
  You've clicked {count} times
</button>

## Import svelte in md

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

