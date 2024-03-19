<script context="module" lang="ts">
  export const FOO = 'BAR'
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  let count = 0

  onMount(() => {
    // mounted
  })
</script>

<button on:click={() => count++}>
  Count is: {count}
</button>
