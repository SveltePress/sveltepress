<script>
  import { createEventDispatcher } from 'svelte'

  export let show = false
  export let top = 0
  export let zIndex = 900

  const dispatcher = createEventDispatcher()

  const handleClose = () => dispatcher('close')
</script>

<div
  class="backdrop"
  class:show
  on:click={handleClose}
  on:keyup={handleClose}
  role="none"
  style:top
  style:z-index={zIndex}
></div>

<style>
  .backdrop {
    --at-apply: 'svp-modal-bg';
  }
  .show {
    --at-apply: 'svp-modal-bg-show';
  }
</style>
