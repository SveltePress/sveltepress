import { writeFileSync } from 'fs'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Data, Node } from 'unist'

const customFence: Plugin<[], Node<Data> & {
  meta?: string
}> = () => {
  return (tree) => {
    writeFileSync('./tree.json', JSON.stringify(tree))
    visit(tree, (node) => {
      if (node.type !== 'code' || !node.meta)
        return
      if (node.type === 'code' && node.meta.split(' ').includes('live')) {
        if (!node.data)
          node.data = {}

        node.data = {
          hName: 'div',
          hProperties: {
            className: 'sveltepress-live-code',
          },
        }
      }
    })
  }
}

export default customFence
