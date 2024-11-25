<script module>
  export const activeNameContextKey = Symbol('activeTab')
  export const itemsKey = Symbol('items')
</script>

<script>
  import { setContext, tick } from 'svelte'

  import { flip } from 'svelte/animate'
  import { cubicInOut } from 'svelte/easing'
  import { writable } from 'svelte/store'
  import { crossfade } from 'svelte/transition'

  const items = writable([])

  let tabContainer = $state()
  let itemWidthArray = $state([])
  /**
   * @typedef {object} Props
   * @property {any} activeName - Active tab name
   * @property {boolean} [bodyPadding] - Whether to add padding to the body
   * @property {import('svelte').Snippet} [children] - Children content
   */

  /** @type {Props} */
  const { activeName, bodyPadding = true, children } = $props()

  const current = writable(activeName)

  setContext(activeNameContextKey, current)
  setContext(itemsKey, items)

  function toggleTab(name) {
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
      }),
    )
  }

  $effect(() => {
    tick().then(() => computedItems($items))
  })
</script>

<svelte:window onresize={computedItems} />

<div class="svp-tab" bind:this={tabContainer}>
  <div class="tab-header" style="--bar-op:0;">
    {#each $items as { name, activeIcon, inactiveIcon } (name)}
      {@const active = $current === name}
      <div
        class="tab-header-item"
        class:active
        data-tab-name={name}
        onclick={() => toggleTab(name)}
        onkeypress={() => toggleTab(name)}
        role="tab"
        tabindex="0"
      >
        {#if active}
          {#if activeIcon}
            {@const SvelteComponent = activeIcon}
            <SvelteComponent />
          {/if}
        {:else if inactiveIcon}
          {@const SvelteComponent_1 = inactiveIcon}
          <SvelteComponent_1 />
        {/if}
        <div class:name={(active && activeIcon) || (!active && inactiveIcon)}>
          {name}
        </div>
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
      ></div>
    {/each}
  </div>
  <div class:padding={bodyPadding}>
    <div class="tab-body">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .svp-tab {
    --at-apply: 'b-1 b-solid b-gray-2 rounded-lg dark:b-gray-8';
  }
  :global(.svp-tab .svp-live-code--container) {
    margin-bottom: 0;
  }
  .padding {
    --at-apply: 'p-4';
  }
  .tab-body {
    --at-apply: 'relative overflow-hidden';
  }
  .tab-header {
    --at-apply: 'relative flex items-center justify-center sm:justify-start bg-white dark:bg-black rounded-t-lg text-4 b-b-1 b-b-gray-2 dark:b-b-gray-8 b-b-solid';
  }
  .tab-header-item {
    --at-apply: 'py-3 px-4 sm:px-8 sm:py-4 cursor-pointer hover:text-svp-hover transition-color flex items-center';
  }
  .name {
    --at-apply: 'ml-2';
  }
  .active-bar {
    --at-apply: 'absolute bottom-0 h-[4px] bg-svp-primary';
    width: var(--bar-width);
    left: var(--bar-left);
  }
</style>
