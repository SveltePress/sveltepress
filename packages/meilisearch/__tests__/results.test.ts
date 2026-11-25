import { describe, expect, it } from 'vitest'
import { HIGHLIGHT_POST, HIGHLIGHT_PRE, normalizeHits, renderHighlighted, safeUrl } from '../src/results'

const hl = (term: string) => `${HIGHLIGHT_PRE}${term}${HIGHLIGHT_POST}`

describe('renderHighlighted', () => {
  it('wraps the matched term in a mark element', () => {
    expect(renderHighlighted(`Quick ${hl('start')} guide`)).toBe('Quick <mark>start</mark> guide')
  })

  it('escapes markup that sits in the indexed document', () => {
    const html = renderHighlighted(`<img src=x onerror="alert(1)"> ${hl('start')}`)

    expect(html).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; <mark>start</mark>')
    expect(html).not.toContain('<img')
  })

  it('does not let a document write its own mark element', () => {
    expect(renderHighlighted('<mark onclick="alert(1)">x</mark>'))
      .toBe('&lt;mark onclick=&quot;alert(1)&quot;&gt;x&lt;/mark&gt;')
  })

  it('escapes the matched term too', () => {
    expect(renderHighlighted(hl('<b>'))).toBe('<mark>&lt;b&gt;</mark>')
  })

  it('drops a marker that has no partner', () => {
    expect(renderHighlighted(`open ${HIGHLIGHT_PRE}only`)).toBe('open only')
    expect(renderHighlighted(`${HIGHLIGHT_POST}close only`)).toBe('close only')
  })

  it('returns an empty string for a missing or non-text field', () => {
    expect(renderHighlighted(undefined)).toBe('')
    expect(renderHighlighted(42)).toBe('')
  })
})

describe('safeUrl', () => {
  it.each([
    '/guide/quick-start/',
    'guide/quick-start/#install',
    '?page=2',
    '#install',
    'https://sveltepress.site/guide/',
    'http://localhost:5173/',
  ])('keeps %s', (url) => {
    expect(safeUrl(url)).toBe(url)
  })

  it.each([
    'javascript:alert(1)',
    '  JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '',
    undefined,
    42,
  ])('replaces %s with #', (url) => {
    expect(safeUrl(url)).toBe('#')
  })

  const char = (code: number) => String.fromCharCode(code)

  it('reads the scheme the way a browser does', () => {
    // The URL parser drops tabs and newlines anywhere in the value, and
    // control characters and spaces at either end, before it looks for a
    // scheme. A check on the raw text lets these through, and the browser
    // then runs them as script.
    const disguised = [
      `java${char(9)}script:alert(1)`,
      `java${char(10)}script:alert(1)`,
      `java${char(13)}script:alert(1)`,
      `${char(1)}javascript:alert(1)`,
      `${char(0)}${char(31)} javascript:alert(1)`,
      `jav${char(9)}asc${char(10)}ript:alert(1)`,
    ]

    for (const url of disguised)
      expect(safeUrl(url), JSON.stringify(url)).toBe('#')
  })

  it('returns the value it checked, without the characters a browser ignores', () => {
    expect(safeUrl(`  /guide/${char(9)}quick-start/${char(10)}`)).toBe('/guide/quick-start/')
    expect(safeUrl(`${char(1)}https://sveltepress.site/`)).toBe('https://sveltepress.site/')
  })
})

describe('normalizeHits', () => {
  it('prefers the highlighted fields and falls back to the plain ones', () => {
    const [first, second] = normalizeHits([
      { id: 1, title: 'Quick start', content: 'Install it', url: '/guide/quick-start/', _formatted: { title: `Quick ${hl('start')}`, content: 'Install it' } },
      { id: 'b', title: 'Sidebar', content: 'Configure <Sidebar>', path: '/guide/sidebar/' },
    ])

    expect(first).toEqual({ id: '1', title: 'Quick <mark>start</mark>', content: 'Install it', url: '/guide/quick-start/' })
    expect(second).toEqual({ id: 'b', title: 'Sidebar', content: 'Configure &lt;Sidebar&gt;', url: '/guide/sidebar/' })
  })

  it('gives every result its own key when the index has no id field', () => {
    // A Meilisearch primary key can have any name. Svelte refuses a keyed
    // each whose keys repeat, so results without an id still need distinct keys.
    const results = normalizeHits([
      { docId: 'a', title: 'One' },
      { docId: 'b', title: 'Two' },
      { docId: 'c', title: 'Three' },
    ])

    expect(new Set(results.map(result => result.id)).size).toBe(3)
  })

  it('never passes a script URL on to navigation', () => {
    const [result] = normalizeHits([{ id: 1, title: 'x', url: 'javascript:alert(1)' }])

    expect(result.url).toBe('#')
  })
})
