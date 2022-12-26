---
title: Title
---

<script>
  let count = 1
</script>

# Heading

:::tip Tip
Some tip content
:::

```svelte live
<script lang="ts">
  let count = 0
  const add = () => {
    count++
  }
</script>

<button type="button" on:click={add}>
  Count is {count}
</button>


<style>
  button {
    color: purple;
  }
</style>
```