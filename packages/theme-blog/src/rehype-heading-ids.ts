import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function textOf(node: Element): string {
  let out = ''
  visit(node, 'text', (t: any) => {
    out += t.value
  })
  return out
}

/**
 * rehype plugin: assign slugified `id` attribute to headings that don't
 * already have one. Resolves collisions by appending `-2`, `-3`, etc.
 */
export function rehypeHeadingIds() {
  return (tree: Root) => {
    const used = new Set<string>()
    visit(tree, 'element', (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName))
        return
      const props = (node.properties ||= {})
      if (props.id) {
        used.add(String(props.id))
        return
      }
      const base = slugify(textOf(node)) || node.tagName
      let id = base
      let n = 2
      while (used.has(id)) id = `${base}-${n++}`
      used.add(id)
      props.id = id
    })
  }
}
