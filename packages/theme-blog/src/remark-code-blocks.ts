import type { Code, Root } from 'mdast'
import { prepareCodeBlock, wrapCodeBlock } from '@sveltepress/vite/highlight'
import { visit } from 'unist-util-visit'
import { highlight } from './highlighter.js'

const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`

const COPY_BUTTON_HTML = `<button class="svp-code-block--copy-btn" aria-label="Copy code"><span class="svp-code-block--copy-icon">${COPY_ICON_SVG}</span><span class="svp-code-block--check-icon">${CHECK_ICON_SVG}</span></button>`

/**
 * Remark plugin that replaces fenced code blocks with Shiki-highlighted,
 * fully-wrapped code block HTML using shared utilities from @sveltepress/vite.
 */
export function remarkCodeBlocks() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (index === undefined || !parent)
        return

      const lang = node.lang || 'text'
      const meta = node.meta || ''

      const prepared = prepareCodeBlock(node.value, meta)
      const highlightedHtml = highlight(prepared.processedCode, lang)

      const fullHtml = wrapCodeBlock(highlightedHtml, lang, prepared, {
        copyButtonHtml: COPY_BUTTON_HTML,
      })

      ;(parent.children[index] as any) = { type: 'html', value: fullHtml }
    })
  }
}
