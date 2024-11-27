<script lang="ts">
  import type { PropType } from './PropType.js'

  const { children, floatingContent, ...rest }: PropType = $props()
</script>

{#await import('./Floating.svelte') then { default: Comp }}
  <Comp {...rest}>
    {@render children?.()}
    {#snippet content()}
      {@render floatingContent?.()}
    {/snippet}
  </Comp>
{/await}
