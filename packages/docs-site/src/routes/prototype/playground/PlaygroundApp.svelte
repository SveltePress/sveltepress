<script lang="ts">
  import type { BootState } from './_prototype'
  import { page } from '$app/state'
  import { entryBySlug } from './_catalog'
  import { currentVariant } from './_prototype'
  import VariantA from './VariantA.svelte'
  import VariantB from './VariantB.svelte'
  import VariantC from './VariantC.svelte'

  let { slug = '' }: { slug?: string } = $props()

  const entry = $derived(entryBySlug(slug) ?? null)
  const variant = $derived(currentVariant(page.url))
  const boot = $derived.by((): BootState => {
    const value = page.url.searchParams.get('boot')
    if (value === 'loading' || value === 'failed' || value === 'ready')
      return value
    return 'ready'
  })
</script>

<!-- Three variants of Playground Feature directory + Hosted editor chrome, switchable via ?variant=, on throwaway /prototype/playground/ routes. -->
{#if variant === 'B'}
  <VariantB {entry} {boot} />
{:else if variant === 'C'}
  <VariantC {entry} {boot} />
{:else}
  <VariantA {entry} {boot} />
{/if}
