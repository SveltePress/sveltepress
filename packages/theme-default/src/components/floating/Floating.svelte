<script>
  import { onMount } from 'svelte'
  import { autoUpdate, computePosition } from '@floating-ui/dom'
  import teleport from '../actions/teleport'

  export let show = false
  export let alwaysShow = false
  export let placement = 'bottom-start'
  export let floatingClass

  let container
  let floatingContent

  const recomputePosition = (nextShow = show) => {
    if (alwaysShow || nextShow) {
      computePosition(container, floatingContent, {
        strategy: 'fixed',
        placement,
        middleware: [],
      }).then(({ x, y }) => {
        Object.assign(floatingContent.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
    }
  }

  onMount(() => {
    recomputePosition()
    return autoUpdate(container, floatingContent, recomputePosition)
  })

  $: recomputePosition(show)
</script>

<span
  bind:this={container}
  class="container"
  on:mouseenter={() => (show = true)}
  on:mouseleave={() => (show = false)}
  role="tooltip"
  {...$$restProps}
>
  <slot />
  <div
    use:teleport
    class="floating-content-wrapper {floatingClass ? ` ${floatingClass}` : ''}"
    class:always-show={alwaysShow}
    class:show={alwaysShow || show}
    bind:this={floatingContent}
    on:mouseenter={() => (show = true)}
    on:mouseleave={() => (show = false)}
    role="tooltip"
  >
    <div class="floating-content">
      <slot name="floating-content" />
    </div>
  </div>
</span>

<style>
  .container {
    word-spacing: -6px;
  }
  .floating-content-wrapper {
    --at-apply: '-z-1 fixed hidden max-w-[60vw] text-[14px] p-1';
  }
  .floating-content {
    --at-apply: 'b-1 dark:b-dark-3 b-warm-gray-3 b-solid p-2 rounded bg-white dark:bg-dark-9';
  }
  .show:not(.always-show) {
    z-index: 99999;
  }
  .always-show {
    z-index: 99998;
  }
  .show {
    display: block;
  }
</style>
