<script context="module" lang="ts">
  export const FOO = 'BAR'
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import FloatingWrapper from '../src/components/FloatingWrapper.svelte'

  let count = 0

  onMount(() => {
    console.log('mounted')
  })
</script>

<button on:click={() => count++}>
  Count is: {count}
</button>

<FloatingWrapper floatingClass="custom-floating-class"
  >Some floating content</FloatingWrapper
>
