import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * rehype plugin: rewrite any `<p>` whose only element child is a single
 * `<img alt="…">` into `<figure><img…/><figcaption>{alt}</figcaption></figure>`.
 *
 * Whitespace-only text nodes inside the paragraph are allowed; any other
 * content disqualifies the paragraph.
 *
 * Per-post caption numbering (`Fig. 01 ·`) is applied in CSS via a counter.
 */
export function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'p')
        return

      const children = node.children ?? []
      const elementChildren = children.filter(c => c.type === 'element')
      if (elementChildren.length !== 1)
        return

      const nonWhitespaceText = children.some(
        c => c.type === 'text' && /\S/.test(c.value),
      )
      if (nonWhitespaceText)
        return

      const img = elementChildren[0] as Element
      if (img.tagName !== 'img')
        return

      const alt = (img.properties?.alt as string | undefined)?.trim()
      if (!alt)
        return

      const figcaption: Element = {
        type: 'element',
        tagName: 'figcaption',
        properties: {},
        children: [{ type: 'text', value: alt }],
      }

      node.tagName = 'figure'
      node.properties = {}
      node.children = [img, figcaption]
    })
  }
}
