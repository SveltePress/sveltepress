<script>
  import { getContext } from 'svelte'
  import { activeNameContextKey, itemsKey } from './Tabs.svelte'

  export let name
  export let activeIcon = undefined
  export let inactiveIcon = undefined

  const current = getContext(activeNameContextKey)
  const items = getContext(itemsKey)

  $items.push({
    name,
    activeIcon,
    inactiveIcon,
  })
  $items = $items
</script>

{#if name === $current}
  <div class="tab-panel">
    <slot />
  </div>
{/if}

<style>
  :global(.tab-panel .svp-code-block-wrapper) {
    --at-apply: 'm-none';
  }
</style>
