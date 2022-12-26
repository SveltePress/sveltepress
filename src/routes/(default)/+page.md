---
title: Title
---

<script>
  let count = 7
</script>

# Heading

<div text-20 text-purple-8>
Hello world!
</div>

:::tip Tip
Some tip content
:::

```svelte live
<script lang="ts">
  let count = 100
  const add = () => {
    count++
  }
</script>

<button type="button" on:click={add}>
  Count is {count}
</button>


<style>
  button {
    color: orange;
  }
</style>
```

```svelte live
<script>
  const message = 'Hello world!'
</script>
<div text-20 text-purple-6>
  {message}
</div>
```