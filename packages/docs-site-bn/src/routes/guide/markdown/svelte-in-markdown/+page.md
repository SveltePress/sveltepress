---
title: Markdown এ Svelte 
---

এই ফিচারটি আপনাকে .md ফাইলে `<style>`, `<script>`, `<script context="module">`, `#if`, `#each`, `#await`, `@html`, `@const`, `<svelte:xxx>` লিখতে দেয়। 

## প্রাথমিক

এখানে একটি `#if`, `#each`, `#await`, `@html`, `@const` এর প্রাথমিক উদাহরণ 

<Tabs activeName="Output">

<TabPanel name="Output">

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

</TabPanel>

<TabPanel name="Input">

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

</TabPanel>

</Tabs>

<div class="mt-4"></div>

:::note[Syntax এর বিধিনিষেধ]{icon=solar:chat-square-code-outline}
মার্কডাউন ফাইলে সর্বদা উদ্ধৃতি ব্যবহার করুন।
```svelte
<script>
  let count = 0
</script>
<button on:click={() => count++}></button> // [svp! --]
<button on:click="{() => count++}"></button> // [svp! ++]
```
:::


## একটি কাউন্টার

<Tabs activeName="Output">

<TabPanel name="Output">

> একটি কাউন্টার

<button on:click="{() => count++}" style="margin-bottom: 12px;">
 আপনি {count} বার ক্লিক করেছেন
</button>

</TabPanel>

<TabPanel name="Input">

```md
> A counter
<script>
  let count = 0
</script>

<button on:click="{() => count++}">
 আপনি {count} বার ক্লিক করেছেন
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

## md ফাইলে svelte ইম্পোর্ট 

<Tabs activeName="Output">

<TabPanel name="Output">

<Counter />

</TabPanel>

<TabPanel name="Input">

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

