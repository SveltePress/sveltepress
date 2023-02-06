<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  import { onMount } from 'svelte'
  import { pwaInfo } from 'virtual:pwa-info'

  let ReloadPrompt: SvelteComponent
  onMount(async () => {
    pwaInfo &&
      (ReloadPrompt = (await import('$lib/ReloadPrompt.svelte')).default)
  })

  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

{#if ReloadPrompt}
  <svelte:component this={ReloadPrompt} />
{/if}
