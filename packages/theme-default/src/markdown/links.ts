import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// parse [foo](bar) to <Link label="foo" to="bar" />
const anchors: Plugin<any[], any> = () => {
  return tree => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'link') {
        parent.children.splice(idx, 1, {
          type: 'html',
          value: `<Link to="${node.url}" label="${node.children[0].value}" />`,
        })
      }
    })
  }
}

export default anchors
