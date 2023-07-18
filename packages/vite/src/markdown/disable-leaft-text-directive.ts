import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

type DisableLeafTextDirectives = () => void | Transformer<Root, Root>

const reserveSvelteCommands: DisableLeafTextDirectives = () => {
  return (tree, file) => {
    visit(tree, node => {
      if (node.type as any === 'leafDirective' || node.type as any === 'textDirective') {
        const { start, end } = node.position || {}
        if (!start || !end)
          return

        if (start.line !== end.line)
          return

        const lines = file.value.split('\n')
        node.type = 'text'
        node.value = lines[start.line - 1]?.slice(start.column - 1, end.column)
        delete node.children
        delete node.attrivutes
      }
    })
  }
}

export default reserveSvelteCommands
