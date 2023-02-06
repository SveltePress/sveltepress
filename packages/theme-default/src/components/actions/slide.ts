import type { Action } from 'svelte/action'

const slide: Action = (node, show) => {
  const initialHeight = `${node.offsetHeight}px`
  node.style.transition = 'max-height 300ms ease-in-out'
  node.style.maxHeight = show ? initialHeight : '0'
  return {
    update(show) {
      node.style.maxHeight = show ? initialHeight : '0'
    },
  }
}

export default slide
