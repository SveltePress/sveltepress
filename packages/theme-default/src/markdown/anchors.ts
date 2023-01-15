import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const anchors: Plugin<any[], any> = () => {
  return (tree, vFile) => {
    const anchors = []
    let id = 1
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
        const title = node.children.filter(c => c.type === 'text').map(c => c.value).join('')

        const slugId = `slug-${id++}`
        parent.children.splice(idx, 1, {
          type: 'slugId',
          data: {
            hName: 'div',
            hProperties: {
              id: slugId,
              className: 'relative bottom-[74px]',
            },
          },
        }, node)
        anchors.push({
          slugId,
          title,
        })
      }
    })
    vFile.data.anchors = anchors
  }
}

export default anchors
