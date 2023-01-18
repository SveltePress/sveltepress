import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const anchors: Plugin<any[], any> = () => {
  return (tree, vFile) => {
    const anchors = []
    visit(tree, (node, idx, parent) => {
      if (node.type === 'heading' && !node.data?.anchorAdded) {
        if (!node.data) {
          node.data = {
            anchorAdded: true,
          }
        }
        else {
          node.data.anchorAdded = true
        }
        const title = node.children.filter(c => ['text', 'inlineCode'].includes(c.type)).map(c => c.value).join('')

        parent.children.splice(idx, 1, {
          type: 'slugId',
          data: {
            hName: 'div',
            hProperties: {
              id: title,
              className: 'svp-anchor-item',
            },
          },
        }, node)
        anchors.push({
          slugId: title,
          title,
          depth: node.depth,
        })
      }
    })
    vFile.data.anchors = anchors
  }
}

export default anchors
