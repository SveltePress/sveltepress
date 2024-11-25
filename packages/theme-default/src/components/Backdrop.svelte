<script>
  import { createEventDispatcher } from 'svelte'

  /**
   * @typedef {object} Props
   * @property {boolean} [show] - Whether the backdrop is visible
   * @property {number} [top] - The top position of the backdrop
   * @property {number} [zIndex] - The z-index of the backdrop
   */

  /** @type {Props} */
  const { show = false, top = 0, zIndex = 900 } = $props()

  const dispatcher = createEventDispatcher()

  const handleClose = () => dispatcher('close')
</script>

<div
  class="backdrop"
  class:show
  onclick={handleClose}
  onkeyup={handleClose}
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
