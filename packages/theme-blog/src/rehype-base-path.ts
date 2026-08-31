import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

export interface RehypeBasePathOptions {
  /** SvelteKit's `paths.base`, with or without a trailing slash. */
  base?: string
}

const URL_ATTRIBUTES: Array<[tagName: string, property: string]> = [
  ['img', 'src'],
  ['a', 'href'],
]

/** Prefix site-absolute URLs in post bodies with the deployment base path. */
export function rehypeBasePath(options: RehypeBasePathOptions = {}) {
  const base = (options.base ?? '').replace(/\/+$/, '')

  return (tree: Root) => {
    if (!base)
      return

    visit(tree, 'element', (node: Element) => {
      for (const [tagName, property] of URL_ATTRIBUTES) {
        if (node.tagName !== tagName)
          continue

        const value = node.properties?.[property]
        if (typeof value !== 'string')
          continue
        if (!value.startsWith('/') || value.startsWith('//'))
          continue
        if (value === base || value.startsWith(`${base}/`))
          continue

        node.properties![property] = `${base}${value}`
      }
    })
  }
}
