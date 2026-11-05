import type { Heading, Html, Parent, Root, RootContent } from 'mdast'
import { visit } from 'unist-util-visit'

/** The container directive node remark-directive produces (`::::name{…}`). */
interface ContainerDirective extends Parent {
  type: 'containerDirective'
  name: string
  attributes?: Record<string, string | null | undefined> | null
}

/**
 * Tabbed panels, one shown at a time, collapsible, with a copy button:
 *
 *     ::::code-tabs{active="vite.config.js"}
 *     ### vue.config.js
 *     ```js
 *     …
 *     ```
 *     ### vite.config.js
 *     ```js
 *     …
 *     ```
 *     ::::
 *
 * The first heading inside the container sets the tab level: every heading
 * of that depth starts a tab and its text is the label. A panel holds
 * whatever follows its heading — usually one code block, but images, text or
 * a nested `code-tabs` work too. Attributes: `active` (label shown first,
 * default the first tab), `vertical` (tabs in a column on the left),
 * `hide-copy` (no copy button).
 *
 * The container becomes `.sp-code-tabs` with one `.sp-code-tabs__src` per
 * panel, rendered by the normal pipeline (so code blocks are highlighted like
 * any other); CodeTabs.svelte turns that markup into the interactive tabs.
 */
export function remarkCodeTabs() {
  return (tree: Root) => {
    visit(tree, (n, index, parent) => {
      if ((n as { type: string }).type !== 'containerDirective' || index === undefined || !parent)
        return
      const node = n as unknown as ContainerDirective
      if (node.name !== 'code-tabs')
        return

      const children = node.children as RootContent[]
      const first = children.find((c): c is Heading => c.type === 'heading')
      if (!first)
        return

      const panels: { label: string, body: RootContent[] }[] = []
      for (const child of children) {
        if (child.type === 'heading' && child.depth === first.depth)
          panels.push({ label: textOf(child), body: [] })
        else if (panels.length)
          panels.at(-1)!.body.push(child)
      }

      const attrs = node.attributes ?? {}
      const active = attrs.active ?? panels[0].label
      const flags = [
        attrs.vertical != null ? ' data-vertical' : '',
        attrs['hide-copy'] != null || attrs.hideCopy != null ? ' data-hide-copy' : '',
      ].join('')

      const html = (value: string): Html => ({ type: 'html', value })
      const replacement: RootContent[] = [
        html(`<div class="sp-code-tabs" data-active="${escapeAttr(active)}"${flags}>`),
        ...panels.flatMap(({ label, body }) => [
          html(`<div class="sp-code-tabs__src" data-label="${escapeAttr(label)}">`),
          ...body,
          html('</div>'),
        ]),
        html('</div>'),
      ]
      parent.children.splice(index, 1, ...(replacement as typeof parent.children))
      // Continue inside the replacement, so nested code-tabs are expanded too.
      return index + 1
    })
  }
}

function textOf(node: Heading): string {
  return node.children
    .map(child => (child.type === 'text' || child.type === 'inlineCode' ? child.value : ''))
    .join('')
    .trim()
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
