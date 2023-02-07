<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte'
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered() {},
    onRegisterError() {},
  })
  const close = () => {
    offlineReady.set(false)
    needRefresh.set(false)
  }
  $: toast = $offlineReady || $needRefresh
</script>

{#if toast}
  <div class="pwa-toast" role="alert">
    <div class="message">
      {#if $offlineReady}
        <span> App ready to work offline </span>
      {:else}
        <span> New content available, click on reload button to update. </span>
      {/if}
    </div>
    {#if $needRefresh}
      <button on:click={() => updateServiceWorker(true)}> Reload </button>
    {/if}
    <button on:click={close}> Close </button>
  </div>
{/if}

<style>
  .pwa-toast {
    --at-apply: 'fixed right-0 bottom-0 m-4 p-3 b-1 b-gray-8 rounded z-1002 bg-white dark:bg-gray-9';
  }
  .pwa-toast .message {
    --at-apply: 'mb-2';
  }
  .pwa-toast button {
    --at-apply: 'outline-none b-1 b-gray-8 mr-2 rounded-sm py-[3px] px-[10px]';
  }
</style>
