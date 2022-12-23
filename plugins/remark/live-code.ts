import { writeFileSync } from 'fs'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const customFence: Plugin = () => {
  return (tree) => {
    writeFileSync('./tree.json', JSON.stringify(tree))
    visit(tree, (node) => {
      if (node.type === 'code' && node.meta.split(' ').includes('live'))
        console.log('is live code')
    })
  }
}

export default customFence
