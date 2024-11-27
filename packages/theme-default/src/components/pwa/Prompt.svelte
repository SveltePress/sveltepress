<script>
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Close from '../icons/Close.svelte'
  import Btn from './Btn.svelte'

  const { message, children } = $props()

  const dispatcher = createEventDispatcher()

  function handleClose() {
    dispatcher('close')
  }

  const DEFAULT_TIP = 'Tip'
  const DEFAULT_CLOSE = 'Close'
</script>

<div class="pwa-toast" role="alert" in:fade>
  <div class="pwa-title">{themeOptions?.i18n?.pwa?.tip || DEFAULT_TIP}</div>
  <div class="message">
    <span> {message} </span>
  </div>
  <div class="actions">
    {@render children?.()}
    <Btn onclick={handleClose} flat>
      {themeOptions?.i18n?.pwa?.close || DEFAULT_CLOSE}
      <Close />
    </Btn>
  </div>
</div>

<style>
  .pwa-title {
    --at-apply: 'font-700 text-svp-primary mb-2';
  }
  .pwa-toast {
    --at-apply: 'fixed w-[50vw] max-w-320px left-[50%] translate-x-[-50%] shadow-lg dark:shadow-gray-6 bottom-0 m-4 p-3 b-1 b-gray-8 rounded-lg z-1002 bg-white dark:bg-black';
  }
  .pwa-toast .message {
    --at-apply: 'mb-3';
  }
  .actions {
    --at-apply: 'flex justify-end mt-8';
  }
</style>
