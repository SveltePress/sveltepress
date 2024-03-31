<script lang="ts">
  import { onMount } from 'svelte'
  import type { Placement } from '@floating-ui/dom'
  import { arrow, autoUpdate, computePosition, offset } from '@floating-ui/dom'
  import teleport from '../actions/teleport'
  import '@shikijs/twoslash/style-rich.css'
  import type { EDirection } from './types'

  export let show = false
  export let alwaysShow = false
  export let placement: Placement = 'bottom-start'
  export let floatingClass: string | undefined = undefined

  let container: HTMLSpanElement
  let floatingContent: HTMLDivElement
  let arrowEl: HTMLDivElement

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
        const side = placement.split('-')[0] as EDirection

        const staticSide: Record<EDirection, string> = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }
        const translate = {
          top: 'translateY(-50%)',
          right: 'translateX(50%)',
          bottom: 'translateY(50%)',
          left: 'translateX(-50%)',
        }
        if (middlewareData.arrow) {
          Object.assign(arrowEl.style, {
            [staticSide[side]]: `${-arrowEl.offsetWidth}px`,
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
    z-index: -1;
    position: fixed;
    display: none;
    max-width: 60vw;
    font-size: 14px;
    border: 1px solid #d6d3d1;
    padding: 0.5rem;
    border-radius: 0.25rem;
    background-color: white;
  }
  :global(html.dark) .floating-content-wrapper {
    border-color: #2d2d2d;
    background-color: #0f0f0f;
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
    position: absolute;
    background-color: inherit;
    width: 0.5rem;
    height: 0.5rem;
    border-style: solid;
    border-color: #d6d3d1;
    color: white;
    font-weight: bold;
    font-size: 90%;
  }
  :global(html.dark .arrow) {
    border-color: #2d2d2d;
  }

  :global(.twoslash-popup-code) {
    background-color: transparent !important;
  }

  :global(.twoslash-popup-docs-tag) {
    display: block;
  }

  :global(.twoslash-popup-docs) {
    --at-apply: 'text-gray-5 dark:text-gray-4';
  }

  :global(.twoslash-popup-docs-tag-name) {
    padding-right: 4px;
  }

  :global(.twoslash-completion-list) {
    margin: 0;
    padding: 0;
  }

  :global(.twoslash-hover) {
    word-spacing: -6px;
  }
</style>
