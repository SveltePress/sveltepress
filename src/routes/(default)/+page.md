
:::tip Tip
Hi, there!
:::

```svelte live foo bar
<script lang="ts">
  let count = 0
  const add = () => {
    count++
  }
</script>

<button type="button" on:click={add}>
  Count is {count}
</button>
```