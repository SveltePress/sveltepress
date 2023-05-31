import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

type ReserveSvelteCommandsPlugin = () => void | Transformer<Root, Root>

const commands = [
  '#each', '/each}',
  '#if', ':else', ':else if', '/if}',
  '#await', ':then', ':catch', '/await}',
  '#key',
  '@html',
  '@debug',
  '@const',
]

const isCommand = (textContent: string) => {
  const trimTextContent = textContent.trim()
  return commands.some(c => trimTextContent.startsWith(`{${c}`))
}

const reserveSvelteCommands: ReserveSvelteCommandsPlugin = () => {
  return (tree, _vFile) => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        const [textNode] = node.children
        if (textNode && textNode.type === 'text' && isCommand(textNode.value)) {
          let value = ''
          const getValue = (node: any) => {
            if (Array.isArray(node.children)) {
              node.children.forEach((n: any) => {
                if (n.type === 'inlineCode')
                  value += `\`${n.value}\``
                else if ('value' in n)
                  value += n.value
                else
                  getValue(n)

                getValue(n)
              })
            }
          }
          getValue(node)
          if (textNode.value.trim().startsWith('{@html'))
            value = value.replace(/&#x3C;/g, '<')

          if (parent && idx !== null) {
            parent.children.splice(idx, 1, {
              type: 'html',
              value,
            })
          }
        }
      }
    })
  }
}

export default reserveSvelteCommands
