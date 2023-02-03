import type { Action } from 'svelte/action'

const slide: Action = (node, show) => {
  const initialHeight = node.offsetHeight
  node.style.transition = 'max-height 300ms ease-in-out'
  if (!show) node.style.maxHeight = '0'

  return {
    update(show) {
      node.style.maxHeight = show ? `${initialHeight}px` : '0'
    },
  }
}

export default slide
