import type { SearchResult } from './types.js'

/**
 * Highlight markers handed to Meilisearch instead of `<mark>`.
 *
 * Meilisearch returns `_formatted` as the document's own field value with the
 * tags inserted, and escapes nothing else. The component renders that with
 * `{@html}`, so asking for `<mark>` directly lets any markup stored in the
 * index reach the DOM. Private use characters do not occur in prose, survive
 * escaping untouched, and are swapped for real elements afterwards.
 */
export const HIGHLIGHT_PRE = '\uE000'
export const HIGHLIGHT_POST = '\uE001'

const HIGHLIGHTED = /\uE000([^\uE000\uE001]*)\uE001/g
const STRAY_MARKER = /[\uE000\uE001]/g

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ESCAPES[char])
}

/** Escaped text with each matched term wrapped in `<mark>`. Safe for `{@html}`. */
export function renderHighlighted(value: unknown): string {
  if (typeof value !== 'string' || !value)
    return ''

  return escapeHtml(value)
    .replace(HIGHLIGHTED, '<mark>$1</mark>')
    .replace(STRAY_MARKER, '')
}

const TAB = 9
const LINE_FEED = 10
const CARRIAGE_RETURN = 13
const SPACE = 32

/**
 * What the URL parser discards before it reads a URL: tabs and newlines
 * anywhere in the value, and control characters and spaces at either end.
 */
function stripIgnoredByUrlParser(value: string): string {
  let start = 0
  let end = value.length
  while (start < end && value.charCodeAt(start) <= SPACE)
    start += 1
  while (end > start && value.charCodeAt(end - 1) <= SPACE)
    end -= 1

  let cleaned = ''
  for (let index = start; index < end; index += 1) {
    const code = value.charCodeAt(index)
    if (code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN)
      cleaned += value[index]
  }
  return cleaned
}

/**
 * A link the result may navigate to: anything that resolves to an http(s)
 * URL, which includes paths on this site. Anything else, `javascript:`
 * included, becomes `#`.
 *
 * The scheme is read by the URL parser, because that is what the browser
 * does with the value. A check on the raw text misses a script URL with a tab
 * inside its scheme or a control character in front of it, and the browser
 * ignores both. The value returned is the one that was checked.
 */
export function safeUrl(value: unknown): string {
  if (typeof value !== 'string')
    return '#'
  const url = stripIgnoredByUrlParser(value)
  if (!url)
    return '#'
  try {
    const { protocol } = new URL(url, 'https://relative.invalid/')
    return protocol === 'http:' || protocol === 'https:' ? url : '#'
  }
  catch {
    return '#'
  }
}

/** One raw Meilisearch hit. Every field is optional: the document's shape is the site's own. */
export interface MeilisearchHit {
  id?: unknown
  title?: unknown
  content?: unknown
  url?: unknown
  path?: unknown
  _formatted?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Map hits onto the shape the result list renders.
 *
 * `id` keys the list. An index may name its primary key anything, so a hit
 * can arrive without an `id`; its position stands in then, because Svelte
 * rejects a keyed each whose keys repeat and results are rebuilt per query.
 */
export function normalizeHits(hits: MeilisearchHit[]): SearchResult[] {
  return hits.map((hit, index) => {
    const formatted = hit._formatted ?? {}
    return {
      id: hit.id === undefined || hit.id === null ? `#${index}` : String(hit.id),
      title: renderHighlighted(formatted.title ?? hit.title),
      content: renderHighlighted(formatted.content ?? hit.content),
      url: safeUrl(hit.url || hit.path),
    }
  })
}
