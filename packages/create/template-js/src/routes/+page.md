---
title: Hello
---

<script>
  let msg = 'Sveltepress!'
</script>

# {title} {msg}

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

<button 
  type="button" 
  on:click={add} 
  class="cursor-pointer px-1 py-2 text-purple-5"
>
  You've clicked button {count} time{count > 0 ? 's' : ''}
</button>
```