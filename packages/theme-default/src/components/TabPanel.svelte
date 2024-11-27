<script>
  import { getContext } from 'svelte'
  import { activeNameContextKey, itemsKey } from './Tabs.svelte'

  const {
    name,
    activeIcon = undefined,
    inactiveIcon = undefined,
    children,
  } = $props()

  const current = getContext(activeNameContextKey)
  const items = getContext(itemsKey)

  $items.push({
    name,
    activeIcon,
    inactiveIcon,
  })
  // eslint-disable-next-line no-self-assign
  $items = $items
</script>

{#if name === $current}
  <div class="tab-panel">
    {@render children?.()}
  </div>
{/if}

<style>
  :global(.tab-panel .svp-code-block-wrapper) {
    --at-apply: 'm-none';
  }
</style>
