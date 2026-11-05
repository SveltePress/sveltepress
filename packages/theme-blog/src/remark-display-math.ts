import type { Root } from 'mdast'
import type { VFile } from 'vfile'
import { visit } from 'unist-util-visit'

/**
 * A line that is nothing but `$$…$$` is display math.
 *
 * remark-math only treats `$$` on a line of its own as a math block; a
 * one-line `$$O(n^2)$$` stays inline math in the surrounding paragraph.
 * markdown-it-katex (what VuePress blogs used) renders it as a centred
 * block, even when the line directly follows text with no blank line in
 * between. This splits such lines out of their paragraph into `math` nodes,
 * so migrated posts render the way they used to.
 *
 * Runs after `remark-math`.
 */
export function remarkDisplayMath() {
  return (tree: Root, file: VFile) => {
    const source = String(file.value ?? '')
    visit(tree, 'paragraph', (node: any, index, parent: any) => {
      if (!parent || index === undefined)
        return
      const blocks = splitParagraph(node, source)
      if (!blocks)
        return
      parent.children.splice(index, 1, ...blocks)
      return index + blocks.length
    })
  }
}

function isDoubleDollar(node: any, source: string): boolean {
  if (node.type !== 'inlineMath')
    return false
  const start = node.position?.start?.offset
  return typeof start === 'number' && source.startsWith('$$', start)
}

function aloneOnLine(children: any[], i: number): boolean {
  const prev = children[i - 1]
  const next = children[i + 1]
  const prevOk = !prev || prev.type === 'break'
    || (prev.type === 'text' && /\n[ \t]*$/.test(prev.value))
  const nextOk = !next || next.type === 'break'
    || (next.type === 'text' && /^[ \t]*(?:\n|$)/.test(next.value))
  return prevOk && nextOk
}

function displayMath(node: any) {
  return {
    type: 'math',
    meta: null,
    value: node.value,
    position: node.position,
    data: {
      hName: 'pre',
      hChildren: [{
        type: 'element',
        tagName: 'code',
        properties: { className: ['language-math', 'math-display'] },
        children: [{ type: 'text', value: node.value }],
      }],
    },
  }
}

function paragraph(children: any[]) {
  const kids = [...children]
  // trim the line breaks that separated this run from the math line
  while (kids.length && kids[0].type === 'break')
    kids.shift()
  while (kids.length && kids.at(-1).type === 'break')
    kids.pop()
  if (kids[0]?.type === 'text')
    kids[0] = { ...kids[0], value: kids[0].value.replace(/^[ \t]*\n/, '') }
  const last = kids.length - 1
  if (kids[last]?.type === 'text')
    kids[last] = { ...kids[last], value: kids[last].value.replace(/\n[ \t]*$/, '') }
  const content = kids.filter(k => !(k.type === 'text' && k.value === ''))
  if (!content.length || content.every(k => k.type === 'text' && !k.value.trim()))
    return null
  return { type: 'paragraph', children: content }
}

function splitParagraph(node: any, source: string): any[] | null {
  const children: any[] = node.children
  const hits = children
    .map((child, i) => (isDoubleDollar(child, source) && aloneOnLine(children, i) ? i : -1))
    .filter(i => i >= 0)
  if (!hits.length)
    return null

  const blocks: any[] = []
  let from = 0
  for (const i of hits) {
    const before = paragraph(children.slice(from, i))
    if (before)
      blocks.push(before)
    blocks.push(displayMath(children[i]))
    from = i + 1
  }
  const after = paragraph(children.slice(from))
  if (after)
    blocks.push(after)
  return blocks
}
