import type { Action } from 'svelte/action'

/**
 * Reparent `node` to `document.body`.
 *
 * Overlays rendered inside the navbar (`z-888`) sit in a stacking context
 * below the sidebar (`z-999`). Moving them to `body` lets `position: fixed`
 * cover the whole site. Destroy only removes the node — Svelte 5 already
 * detaches with `node.remove()`, and putting it back would leak it.
 */
const portal: Action<HTMLElement> = (node) => {
  document.body.appendChild(node)

  return {
    destroy() {
      node.remove()
    },
  }
}

export default portal
