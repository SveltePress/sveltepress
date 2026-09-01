<script>
  import { page } from '$app/state'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import Refresh from '../icons/Refresh.svelte'
  import { resolveLocaleOptions } from '../locale'
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
  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const appReadyToWorkOffline =
    localeOptions?.i18n?.pwa?.appReadyToWorkOffline || DEFAULT_WORK_OFFLINE
  const newContentAvailable =
    localeOptions?.i18n?.pwa?.newContentAvailable ||
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
        {localeOptions?.i18n?.pwa?.reload || DEFAULT_RELOAD}
        <Refresh />
      </Btn>
    {/if}
  </Prompt>
{/if}
