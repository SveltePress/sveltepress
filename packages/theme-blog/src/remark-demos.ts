import type { Html, Parent, Root } from 'mdast'
import { SKIP, visit } from 'unist-util-visit'

export interface RemarkDemosOptions {
  /**
   * Component names available to posts — the `.svelte` files in the
   * project's demos directory, without the extension.
   */
  names?: Iterable<string>
}

const PHRASING_PARENTS = new Set([
  'paragraph',
  'heading',
  'emphasis',
  'strong',
  'delete',
  'link',
  'linkReference',
  'tableCell',
])

/**
 * Lets a post use the project's own Svelte components. Posts are compiled to
 * static HTML, so `<Name />` can't become a component inline; when `Name` is
 * one of the project's demo components, the tag is replaced by a placeholder
 * that Demos.svelte mounts the component into, in the same spot.
 *
 * Attributes become props: `text="x"` → `{ text: 'x' }`, `package-name="y"`
 * → `{ packageName: 'y' }`, a bare `dev` → `{ dev: true }`. Other tags are
 * left alone. A tag on its own line gets a block placeholder (`div`); one
 * inside a paragraph or heading gets an inline one (`span`).
 */
export function remarkDemos(options: RemarkDemosOptions = {}) {
  const names = new Set(options.names ?? [])
  return (tree: Root) => {
    if (!names.size)
      return
    visit(tree, 'html', (node: Html, index, parent) => {
      if (index === undefined || !parent)
        return
      const tag = parseTag(node.value)
      if (!tag || !names.has(tag.name))
        return
      const el = PHRASING_PARENTS.has((parent as Parent).type) ? 'span' : 'div'
      const props = Object.keys(tag.props).length
        ? ` data-props="${escapeAttr(JSON.stringify(tag.props))}"`
        : ''
      node.value = `<${el} class="sp-demo" data-demo="${escapeAttr(tag.name)}"${props}></${el}>`
      return SKIP
    })
  }
}

const TAG = /^<([A-Z][\w-]*)((?:\s+[^\s"'=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(?:\/>|>\s*<\/\1\s*>)$/
const ATTR = /([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g

/**
 * `<Name a="1" b />` or `<Name></Name>` → name and props. Only names starting
 * with a capital letter, so plain HTML (`<br />`, `<img …/>`) never matches.
 */
export function parseTag(value: string): { name: string, props: Record<string, string | true> } | null {
  const match = value.trim().match(TAG)
  if (!match)
    return null
  const props: Record<string, string | true> = {}
  for (const [, key, double, single] of match[2].matchAll(ATTR))
    props[camelCase(key)] = double ?? single ?? true
  return { name: match[1], props }
}

function camelCase(key: string): string {
  return key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
