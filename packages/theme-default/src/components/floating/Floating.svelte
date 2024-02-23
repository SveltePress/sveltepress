<script>
  import { onMount } from 'svelte'
  import { autoUpdate, computePosition, offset } from '@floating-ui/dom'
  import teleport from '../actions/teleport'

  export let show = false
  export let alwaysShow = false
  export let floatingClass

  let container
  let floatingContent

  const recomputePosition = (nextShow = show) => {
    if (alwaysShow || nextShow) {
      computePosition(container, floatingContent, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [offset(5)],
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
    class="floating-content {floatingClass ? ` ${floatingClass}` : ''}"
    class:show={alwaysShow || show}
    class:always-show={alwaysShow}
    bind:this={floatingContent}
  >
    <slot name="floating-content" />
  </div>
</span>

<style>
  .container {
    word-spacing: -6px;
  }
  .floating-content {
    --at-apply: '-z-1 fixed hidden max-w-[60vw] bg-white dark:bg-black rounded text-[14px] p-2';
  }
  .show:not(.always-show) {
    z-index: 99999;
  }
  .always-show {
    z-index: 99998;
    --at-apply: 'b-1 dark:b-dark-3 b-warm-gray-4 b-solid';
  }
  .show {
    display: block;
  }
</style>
