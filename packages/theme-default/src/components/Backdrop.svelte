<script>
  import { createEventDispatcher } from 'svelte'

  export let show = false

  const dispatcher = createEventDispatcher()

  const handleClose = () => dispatcher('close')
</script>

<div
  class="backdrop"
  class:show={show}
  on:click={handleClose}
  on:keyup={handleClose}
/>

<style>
  .backdrop {
    --at-apply: 'svp-modal-bg';
  }
  .show {
    --at-apply: 'svp-modal-bg-show';
  }
</style>
