import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

// parse [foo](bar) to <Link label="foo" to="bar" />
const anchors: Plugin<any[], any> = () => {
  return (tree) => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'link') {
        parent.children.splice(idx, 1, {
          type: 'html',
          value: `<Link to="${node.url}">{#snippet labelRenderer()}`,
        }, ...node.children, {
          type: 'html',
          value: '{/snippet}</Link>',
        }, {
          type: 'SvpHeading',
          value: node.children[0].value,
        })
      }
      if (node.type === 'SvpHeading') {
        parent.children.splice(idx, 1)
      }
    })
  }
}

export default anchors
