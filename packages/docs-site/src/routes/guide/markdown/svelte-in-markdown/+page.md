---
title: Svelte in markdown
---

This feature is provided by [Mdsvex](https://mdsvex.com/)  
`<style>`, `<script>` and `<script context="module">` can be used in .md files


## Examples

**Input**

````md
> A counter
<script>
  let count = 0
</script>

<button on:click={() => count++}>
  You've clicked {count} times
</button>
````

**Output**

> A counter

<script>
  let count = 0
</script>

<button on:click={() => count++}>
  You've clicked {count} times
</button>