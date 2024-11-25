<script module lang="ts">
  export const FOO = 'BAR'
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  let count = $state(0)

  onMount(() => {
    // mounted
  })
</script>

<button onclick={() => count++}>
  Count is: {count}
</button>
