<script>
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import Close from '../icons/Close.svelte'
  import Btn from './Btn.svelte'
  export let message

  const dispatcher = createEventDispatcher()

  const handleClose = () => {
    dispatcher('close')
  }
</script>

<div class="pwa-toast" role="alert" in:fade>
  <div class="pwa-title">Tip</div>
  <div class="message">
    <span> {message} </span>
  </div>
  <div class="actions">
    <slot />
    <Btn on:click={handleClose} flat>
      Close
      <Close />
    </Btn>
  </div>
</div>

<style>
  .pwa-title {
    --at-apply: 'font-700 text-rose-4 mb-2';
  }
  .pwa-toast {
    --at-apply: 'fixed w-[50vw] max-w-320px left-[50%] translate-x-[-50%] shadow-lg dark:shadow-gray-6 bottom-0 m-4 p-3 b-1 b-gray-8 rounded-lg z-1002 bg-white dark:bg-black';
  }
  .pwa-toast .message {
    --at-apply: 'mb-3';
  }
  .actions {
    --at-apply: flex justify-end mt-8;
  }
</style>
