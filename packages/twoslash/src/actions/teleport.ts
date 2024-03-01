import type { Action } from 'svelte/action'

const teleport: Action<HTMLDivElement> = node => {
  document.body.append(node)

  return {
    destroy() {
      node.remove()
    },
  }
}

export default teleport
