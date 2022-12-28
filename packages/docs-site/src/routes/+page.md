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
<script>
  let count = 0
  const add = () => {
    count++
  }
</script>

<button 
  type="button" 
  on:click={add} 
  class="cursor-pointer px-1 py-2 text-purple-5"
>
  Count is {count}
</button>
```