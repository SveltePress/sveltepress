import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Turns `:::pull …body… :::` container directives into a
 * `<blockquote class="pull">…</blockquote>` HAST element on render.
 *
 * Requires `remark-directive` upstream to produce the directive nodes.
 */
export function remarkPullQuote() {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective')
        return
      if (node.name !== 'pull')
        return

      const data = (node.data ||= {})
      data.hName = 'blockquote'
      data.hProperties = { className: ['pull'] }
    })
  }
}
