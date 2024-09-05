<script context="module" lang="ts">
  export const FOO = 'BAR'
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import FloatingWrapper from '@sveltepress/twoslash/FloatingWrapper.svelte'

  let count = 0

  onMount(() => {
    console.log('mounted')
  })
</script>

<button on:click={() => count++}>
  Count is: {count}
</button>

<FloatingWrapper placement="right">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">Trigger</div>

  <div
    class="bg-white dark:bg-dark b-solid b-1 b-red rounded p-4"
    slot="floating-content"
  >
    Floating content
  </div>
</FloatingWrapper>
