import type { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

type DisableLeafTextDirectives = () => void | Transformer<Root, Root>

const reserveSvelteCommands: DisableLeafTextDirectives = () => {
  return (tree, file) => {
    visit(tree, (node: any) => {
      if (node.type as any === 'leafDirective' || node.type as any === 'textDirective') {
        const { start, end } = node.position || {}
        if (!start || !end)
          return

        if (start.line !== end.line)
          return

        const lines = file.value.toString().split('\n')
        node.type = 'text'
        node.value = lines[start.line - 1]?.slice(start.column - 1, end.column)
        delete node.children
        delete node.attributes
      }
    })
  }
}

export default reserveSvelteCommands
