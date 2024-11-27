<script>
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Refresh from '../icons/Refresh.svelte'
  import Btn from './Btn.svelte'
  import Prompt from './Prompt.svelte'

  const DEFAULT_WORK_OFFLINE = 'App ready to work offline'
  const DEFAULT_NEW_CONTENT_AVAILABLE =
    'New content available, click on reload button to update'
  const DEFAULT_RELOAD = 'Reload'

  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered() {},
    onRegisterError() {},
  })
  function close() {
    offlineReady.set(false)
    needRefresh.set(false)
  }
  const appReadyToWorkOffline =
    themeOptions?.i18n?.pwa?.appReadyToWorkOffline || DEFAULT_WORK_OFFLINE
  const newContentAvailable =
    themeOptions?.i18n?.pwa?.newContentAvailable ||
    DEFAULT_NEW_CONTENT_AVAILABLE
  const toast = $derived($offlineReady || $needRefresh)
  const message = $derived(
    $offlineReady ? appReadyToWorkOffline : newContentAvailable,
  )
</script>

{#if toast}
  <Prompt {message} on:close={close}>
    {#if $needRefresh}
      <Btn onclick={() => updateServiceWorker(true)}>
        {themeOptions?.i18n?.pwa?.reload || DEFAULT_RELOAD}
        <Refresh />
      </Btn>
    {/if}
  </Prompt>
{/if}
