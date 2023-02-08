<script>
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  import Refresh from '../icons/Refresh.svelte'
  import Btn from './Btn.svelte'
  import Prompt from './Prompt.svelte'
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered() {},
    onRegisterError() {},
  })
  const close = () => {
    offlineReady.set(false)
    needRefresh.set(false)
  }
  $: toast = $offlineReady || $needRefresh
  $: message = $offlineReady
    ? 'App ready to work offline'
    : 'New content available, click on reload button to update.'
</script>

{#if toast}
  <Prompt {message} on:close={close}>
    {#if $needRefresh}
      <Btn on:click={() => updateServiceWorker(true)}>
        Reload
        <Refresh />
      </Btn>
    {/if}
  </Prompt>
{/if}
