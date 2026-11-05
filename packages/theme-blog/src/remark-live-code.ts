import type { Code, Html, Root } from 'mdast'
import { createHash } from 'node:crypto'
import { SKIP, visit } from 'unist-util-visit'

/** One ```svelte live block: the component source and its content id. */
export interface LiveCodeBlock {
  id: string
  code: string
}

export interface RemarkLiveCodeOptions {
  /** Label of the toggle that shows or hides the source. */
  sourceLabel?: string
}

/**
 * The blog counterpart of theme-default's live code. Posts are compiled to
 * static HTML, so a ```svelte live block can't become a component inline.
 * Instead the block's source is collected on `file.data.liveCode` (the vite
 * plugin writes each one to `.sveltepress/live-code/<id>.svelte`), and the
 * block is replaced by a demo placeholder that LiveCode.svelte mounts the
 * compiled component into, followed by the highlighted source.
 *
 * Meta: `live` turns it on; `collapsed` starts with the source hidden; any
 * other meta (`title=…`, `ln`, …) is kept for the source code block.
 */
export function remarkLiveCode(options: RemarkLiveCodeOptions = {}) {
  const sourceLabel = escapeHtml(options.sourceLabel ?? 'View code')
  return (tree: Root, file: { data: Record<string, unknown> }) => {
    const blocks: LiveCodeBlock[] = []
    visit(tree, 'code', (node: Code, index, parent) => {
      if (index === undefined || !parent || node.lang !== 'svelte')
        return
      const meta = (node.meta ?? '').split(' ').filter(Boolean)
      if (!meta.includes('live'))
        return

      const id = createHash('sha256').update(node.value).digest('hex').slice(0, 16)
      if (!blocks.some(b => b.id === id))
        blocks.push({ id, code: node.value })

      const collapsed = meta.includes('collapsed')
      const source: Code = {
        type: 'code',
        lang: 'svelte',
        meta: meta.filter(m => m !== 'live' && m !== 'collapsed').join(' ') || null,
        value: node.value,
      }
      const open: Html = {
        type: 'html',
        value: `<div class="sp-live-code"><div class="sp-live-code__demo" data-live="${id}"></div><details class="sp-live-code__source"${collapsed ? '' : ' open'}><summary>${sourceLabel}</summary>`,
      }
      const close: Html = { type: 'html', value: '</details></div>' }
      parent.children.splice(index, 1, open, source, close)
      // Skip past the three nodes; the source block is left for
      // remark-code-blocks to highlight.
      return [SKIP, index + 3]
    })
    file.data.liveCode = blocks
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
