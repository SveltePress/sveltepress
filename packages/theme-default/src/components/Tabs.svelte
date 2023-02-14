<script context="module">
  export const activeNameContextKey = Symbol('activeTab')
  export const namesKey = Symbol('names')
</script>

<script>
  import { writable } from 'svelte/store'
  import { setContext, tick } from 'svelte'
  import { flip } from 'svelte/animate'
  import { crossfade } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  export let activeName

  const names = writable([])

  let tabContainer
  let itemWidthArray = []

  const current = writable(activeName)

  setContext(activeNameContextKey, current)
  setContext(namesKey, names)

  const toggleTab = name => {
    $current = name
  }

  const [send, receive] = crossfade({
    fallback(node) {
      const style = getComputedStyle(node)
      const transform = style.transform === 'none' ? '' : style.transform

      return {
        duration: 500,
        easing: cubicInOut,
        css: t => `
					transform: ${transform};
					opacity: ${t};
				`,
      }
    },
  })

  function computedItems() {
    if (!tabContainer) return
    itemWidthArray = [...tabContainer.querySelectorAll('.tab-header-item')].map(
      item => ({
        left: item.offsetLeft,
        width: item.offsetWidth,
        name: item.dataset.tabName,
      })
    )
  }

  $: {
    $names
    tick().then(computedItems)
  }
</script>

<div class="tab" bind:this={tabContainer}>
  <div class="tab-header" style="--bar-op:0;">
    {#each $names as name (name)}
      {@const active = $current === name}
      <div
        class="tab-header-item"
        class:active
        data-tab-name={name}
        on:click={() => toggleTab(name)}
        on:keypress={() => toggleTab(name)}
      >
        {name}
      </div>
    {/each}
    {#each itemWidthArray.filter(n => n.name === $current) as { width, left }, i (i)}
      <div
        class="active-bar"
        style={`--bar-width: ${width}px;--bar-left: ${left}px;`}
        in:receive={{
          key: i,
        }}
        out:send={{
          key: i,
        }}
        animate:flip={{
          duration: 200,
          easing: cubicInOut,
        }}
      />
    {/each}
  </div>
  <div class="tab-body-wrapper">
    <div class="tab-body">
      <slot />
    </div>
  </div>
</div>

<style>
  .tab {
    --at-apply: ' b-1 b-solid b-gray-2 rounded-lg dark:b-gray-8';
  }
  .tab-body-wrapper {
    --at-apply: 'p-4';
  }
  .tab-body {
    --at-apply: 'relative overflow-hidden';
  }
  .tab-header {
    --at-apply: 'relative flex items-center bg-white dark:bg-black rounded-t-lg';
  }
  .tab-header-item {
    --at-apply: 'px-8 py-4 cursor-pointer hover:text-rose-5 transition-color';
  }
  .active-bar {
    --at-apply: 'absolute bottom-0 h-[4px] bg-rose-5';
    width: var(--bar-width);
    left: var(--bar-left);
  }
</style>
