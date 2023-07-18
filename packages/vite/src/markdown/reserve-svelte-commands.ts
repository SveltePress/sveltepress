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

function isCommand(textContent: string) {
  const trimTextContent = textContent.trim()
  return commands.some(c => trimTextContent.startsWith(`{${c}`))
}

const reserveSvelteCommands: ReserveSvelteCommandsPlugin = () => {
  return (tree, _vFile) => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        if (node && node.type === 'paragraph') {
          const firstNode = node.children?.[0]
          if (firstNode && firstNode.type === 'text' && isCommand(firstNode.value)) {
            let value = ''
            const getValue = (node: any) => {
              if (node.type === 'inlineCode')
                value += `\`${node.value}\``
              else if ('value' in node)
                value += node.value
            }
            node.children.forEach(getValue)
            if (node.value?.trim().startsWith('{@html'))
              value = value.replace(/&#x3C;/g, '<')
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
