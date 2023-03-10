---
title: Svelte in markdown
---

This feature allow you to write 
`<style>`, `<script>` and `<script context="module">` in .md files


## Simple example

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
</script>

<button on:click="{() => count++}" style="margin-bottom: 12px;">
  You've clicked {count} times
</button>

:::note[Syntax Restrictions]
Always use quotes in markdown files.
```svelte
  <button on:click={() => count++}></button> // [svp! --]
  <button on:click="{() => count++}"></button> // [svp! ++]
```
:::

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

