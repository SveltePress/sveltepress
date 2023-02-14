<script>
  import { getContext } from 'svelte'
  import { fly } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  import { activeNameContextKey, namesKey } from './Tabs.svelte'
  export let name

  const current = getContext(activeNameContextKey)
  const names = getContext(namesKey)

  $names.push(name)
  $names = $names

  const outFly = (node, params) => {
    const existingTransform = getComputedStyle(node).transform.replace(
      'none',
      ''
    )

    return {
      ...params,
      css: (t, u) =>
        `transform: ${existingTransform} translateX(${
          u * 200
        }px);opacity:${t};position: absolute;top:0;left:0;right:0;bottom:0;`,
    }
  }
</script>

{#if name === $current}
  <div
    class="tab-panel"
    in:fly={{
      easing: cubicInOut,
      duration: 300,
      x: -200,
    }}
    out:outFly={{
      easing: cubicInOut,
      duration: 300,
    }}
  >
    <slot />
  </div>
{/if}

<style>
  .tab-panel {
    --at-apply: '';
  }
</style>
