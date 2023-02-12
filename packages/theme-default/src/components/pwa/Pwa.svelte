<script>
  import { onMount } from 'svelte'
  import { pwaInfo } from 'virtual:pwa-info'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { isDark } from '../layout'

  let ReloadPrompt
  onMount(async () => {
    pwaInfo && (ReloadPrompt = (await import('./ReloadPrompt.svelte')).default)
  })

  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
  {#if themeOptions?.pwa?.darkManifest && $isDark}
    <meta rel="manifest" href={themeOptions.pwa.darkManifest} />
  {:else}
    {@html webManifest}
  {/if}
</svelte:head>

{#if ReloadPrompt}
  <svelte:component this={ReloadPrompt} />
{/if}
