import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// Transform image node to enhanced:img element
const enhancedImagesPlugin: Plugin = () => {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type !== 'image')
        return
      const attributes = []

      if (node.url) {
        attributes.push(`src="${node.url}"`)
      }

      if (node.alt) {
        attributes.push(`alt="${node.alt}"`)
      }

      if (node.title) {
        attributes.push(`title="${node.title}"`)
      }

      node.type = 'html'
      node.value = `<enhanced:img ${attributes.join(' ')} />`
    })
  }
}

export default enhancedImagesPlugin
