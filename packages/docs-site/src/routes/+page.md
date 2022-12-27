---
title: Title
---

<script>
  let count = 7
</script>

# Heading

:::tip Tip
Some tip content
:::

```svelte live
<script lang="ts">
  let count = 10
  const add = () => {
    count++
  }
</script>

<button type="button" on:click={add} text-orange>
  Count is {count}
</button>
```

```svelte live
<script>
  const message = 'Hello world!'
</script>
<div text-purple-8 text-20>
  {message}
</div>