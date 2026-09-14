<script>
  import { onMount } from 'svelte'

  const { children } = $props()

  let Prototype = $state()

  onMount(async () => {
    if (!import.meta.env.DEV) return
    const module = await import(
      /* eslint-disable-next-line style/comma-dangle -- prettier rejects the trailing comma here */
      '$lib/prototype/open-in-playground/OpenInPlaygroundPrototype.svelte'
    )
    Prototype = module.default
  })
</script>

{@render children?.()}
{#if Prototype}
  {@const OpenInPlaygroundPrototype = Prototype}
  <OpenInPlaygroundPrototype />
{/if}
