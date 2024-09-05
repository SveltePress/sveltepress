<script lang="ts">
  import type { Placement } from '@floating-ui/dom'

  export let show = false
  export let alwaysShow = false
  export let placement: Placement = 'bottom-start'
  export let floatingClass: string | undefined = undefined
</script>

{#await import('./Floating.svelte') then floatingComponent}
  <svelte:component
    this={floatingComponent.default}
    {show}
    {alwaysShow}
    {placement}
    {floatingClass}
    {...$$restProps}
  >
    <slot />
    <!-- apply content -->
    <slot slot="content" name="floating-content" />
  </svelte:component>
{/await}
