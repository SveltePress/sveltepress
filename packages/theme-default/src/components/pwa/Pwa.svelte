<script>
  import { onMount } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { isDark } from '../layout'

  let ReloadPrompt = $state()
  let webManifest = $state()
  onMount(async () => {
    if (themeOptions.pwa) {
      const { pwaInfo } = await import('virtual:pwa-info')
      webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
      if (pwaInfo) {
        ReloadPrompt = (await import('./ReloadPrompt.svelte')).default
      }
    }
  })
</script>

<svelte:head>
  {#if themeOptions?.pwa?.darkManifest && $isDark}
    <meta rel="manifest" href={themeOptions.pwa.darkManifest} />
  {:else}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html webManifest}
  {/if}
</svelte:head>

{#if ReloadPrompt}
  <ReloadPrompt />
{/if}
