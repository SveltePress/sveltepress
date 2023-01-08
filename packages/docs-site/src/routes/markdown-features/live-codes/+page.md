---
title: Live Codes
---

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
  class="cursor-pointer"
>
  Count is {count} 
</button>
```

```svelte live
<script lang="ts">
  let msg = 'world!'

  const toggle = () => {
    msg = msg === 'hello' ? 'world!' : 'hello'
  }
</script>

<button 
  type="button" 
  on:click={toggle} 
  class="cursor-pointer px-4 py-2 text-purple border-0 rounded-sm hover:bg-gray-1 active:bg-gray-2"
>
  Toggle message
</button>

<div text-blue>
  Message: {msg}
</div>
```