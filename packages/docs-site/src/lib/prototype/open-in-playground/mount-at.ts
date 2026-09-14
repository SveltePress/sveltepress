import type { Action } from 'svelte/action'

export interface MountTarget {
  el: Element
  where: 'append' | 'prepend' | 'after' | 'before'
  decorate?: (el: Element) => (() => void) | void
}

export const mountAt: Action<HTMLElement, { key: string, pick: () => MountTarget | null }> = (
  node,
  param,
) => {
  let undecorate: (() => void) | undefined
  let lastKey = ''
  let retries = 0
  let timer: number | undefined
  let current = param

  function place(target: MountTarget) {
    if (target.where === 'append')
      target.el.appendChild(node)
    else if (target.where === 'prepend')
      target.el.prepend(node)
    else if (target.where === 'before')
      target.el.before(node)
    else
      target.el.after(node)
    const cleanup = target.decorate?.(target.el)
    if (typeof cleanup === 'function')
      undecorate = cleanup
  }

  function apply(force = false) {
    if (!force && current.key === lastKey && node.isConnected && !node.hidden)
      return
    undecorate?.()
    undecorate = undefined
    const target = current.pick()
    if (!target) {
      node.hidden = true
      if (retries < 20) {
        retries += 1
        timer = window.setTimeout(() => apply(true), 50)
      }
      return
    }
    retries = 0
    lastKey = current.key
    node.hidden = false
    place(target)
  }

  apply(true)
  return {
    update(next) {
      current = next
      retries = 0
      apply(next.key !== lastKey)
    },
    destroy() {
      window.clearTimeout(timer)
      undecorate?.()
      node.remove()
    },
  }
}
