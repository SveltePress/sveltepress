import type { Action } from 'svelte/action'

/**
 * Slide open/close by animating max-height.
 *
 * The height is measured at each toggle (not captured once at mount), and
 * the cap is released (`max-height: none`) once the opening transition ends —
 * so content that grows later (e.g. a collapsed long code block being
 * expanded inside the panel) is never clipped.
 */
const slide: Action<HTMLElement, boolean | undefined> = (node, show) => {
  // Initial state applies on first paint — no animation.
  node.style.transition = 'max-height 300ms ease-in-out'
  node.style.maxHeight = show ? 'none' : '0'

  // Ignore transitions bubbling up from children (the node's own content
  // animates too, e.g. the code expand bar).
  function onTransitionEnd(e: TransitionEvent) {
    if (
      e.target === node
      && e.propertyName === 'max-height'
      && node.style.maxHeight !== '0px'
      && node.style.maxHeight !== '0'
    ) {
      node.style.maxHeight = 'none'
    }
  }
  node.addEventListener('transitionend', onTransitionEnd)

  return {
    update(show) {
      if (show) {
        // scrollHeight reports the full content height even while capped
        node.style.maxHeight = `${node.scrollHeight}px`
      }
      else {
        if (node.style.maxHeight === 'none' || node.style.maxHeight === '') {
          // re-cap at the current height so the closing transition has a
          // concrete start value ('none' → 0 would snap instead of animate)
          node.style.maxHeight = `${node.scrollHeight}px`
          // force a reflow so the start height registers before we drop to 0
          void node.offsetHeight
        }
        node.style.maxHeight = '0'
      }
    },
    destroy() {
      node.removeEventListener('transitionend', onTransitionEnd)
    },
  }
}

export default slide
