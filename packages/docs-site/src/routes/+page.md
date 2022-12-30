---
hello: Hello
---

<script>
  let msg = 'Sveltepress!'
</script>

# {hello} {msg}

:::tip Tip
Some tip content
:::

```svelte live
<script lang="ts">
  let count = 1
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