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
  class="cursor-pointer px-1 py-2 text-purple-5"
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
  class="cursor-pointer px-1 py-2 text-purple-5"
>
  Toggle
</button>

<div text-blue>
  Message: {msg}
</div>
```