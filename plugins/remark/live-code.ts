import { writeFileSync } from 'fs'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const customFence: Plugin = function () {
  return (tree) => {
    writeFileSync('./tree.json', JSON.stringify(tree))
    visit(tree, node => node.type === 'code', (node, index, parent) => {
      console.log('[Live Code]', node, index, parent)
    })
  }
}

export default customFence
