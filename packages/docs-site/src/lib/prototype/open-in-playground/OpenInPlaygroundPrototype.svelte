<script lang="ts">
  import type { VariantKey } from './entries'
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { onMount, tick } from 'svelte'
  import { resolveLeaf, VARIANT_KEYS } from './entries'
  import PrototypeSwitcher from './PrototypeSwitcher.svelte'
  import VariantA from './VariantA.svelte'
  import VariantB from './VariantB.svelte'
  import VariantC from './VariantC.svelte'
  import VariantD from './VariantD.svelte'

  // Throwaway: four placements of Open in Playground on real Default Theme leaves.
  const onPlaygroundChromePrototype = $derived(
    page.url.pathname.includes('/prototype/playground'),
  )
  const leaf = $derived(resolveLeaf(page.url.pathname))
  const variant = $derived.by((): VariantKey => {
    const raw = page.url.searchParams.get('variant')?.toUpperCase()
    return VARIANT_KEYS.includes(raw as VariantKey) ? (raw as VariantKey) : 'A'
  })

  let generation = $state(0)
  afterNavigate(() => {
    void tick().then(() => {
      generation += 1
    })
  })

  onMount(() => {
    const mq = window.matchMedia('(min-width: 950px)')
    const onChange = () => {
      generation += 1
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  })
</script>

{#if !onPlaygroundChromePrototype}
  {#key `${variant}:${leaf.logicalPath}:${generation}`}
    {#if variant === 'A'}
      <VariantA {leaf} />
    {:else if variant === 'B'}
      <VariantB {leaf} />
    {:else if variant === 'C'}
      <VariantC {leaf} />
    {:else}
      <VariantD {leaf} />
    {/if}
  {/key}
  <PrototypeSwitcher {variant} {leaf} />
{/if}
