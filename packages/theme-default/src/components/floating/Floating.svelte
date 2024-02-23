<script>
  import { onMount } from 'svelte'
  import { arrow, autoUpdate, computePosition, offset } from '@floating-ui/dom'
  import teleport from '../actions/teleport'

  export let show = false
  export let alwaysShow = false
  export let placement = 'bottom-start'
  export let floatingClass

  let container
  let floatingContent
  let arrowEl

  const recomputePosition = (nextShow = show) => {
    if (alwaysShow || nextShow) {
      computePosition(container, floatingContent, {
        strategy: 'fixed',
        placement,
        middleware: [
          offset(5),
          arrow({
            element: arrowEl,
          }),
        ],
      }).then(({ x, y, middlewareData, placement }) => {
        Object.assign(floatingContent.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
        const side = placement.split('-')[0]

        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side]
        const translate = {
          top: 'translateY(-50%)',
          right: 'translateX(50%)',
          bottom: 'translateY(50%)',
          left: 'translateX(-50%)',
        }
        if (middlewareData.arrow) {
          Object.assign(arrowEl.style, {
            [staticSide]: `${-arrowEl.offsetWidth}px`,
            borderWidth: `${side === 'bottom' || side === 'left' ? '1px' : 0} ${side === 'left' || side === 'top' ? '1px' : 0} ${side === 'top' || side === 'right' ? '1px' : 0} ${side === 'bottom' || side === 'right' ? '1px' : 0}`,
            transform: `${translate[side]} rotate(45deg)`,
          })
        }
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
    <div bind:this={arrowEl} class="arrow"></div>
    <slot name="floating-content" />
  </div>
</span>

<style>
  .container {
    word-spacing: -6px;
  }
  .floating-content-wrapper {
    --at-apply: '-z-1 fixed hidden max-w-[60vw] text-[14px] b-1 dark:b-dark-3 b-warm-gray-3 b-solid p-2 rounded bg-white dark:bg-dark-9';
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
  .arrow {
    --at-apply: 'absolute bg-inherit w-2 h-2 b-solid dark:b-dark-3 b-warm-gray-3';
    color: white;
    font-weight: bold;
    font-size: 90%;
  }
</style>
