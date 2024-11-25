<script>
  import { onMount } from 'svelte'

  let { message = 'World' } = $props()

  let count = $state(0)

  onMount(() => {
    console.log('mount')
  })
</script>
<button onclick={() => count++}>
  Count is: {count}
</button>
<div class="text-6">
  Hello, {message}
</div>