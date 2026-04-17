import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { remarkPullQuote } from '../src/remark-pull-quote.js'

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkPullQuote)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('remarkPullQuote', () => {
  it('transforms a :::pull container into a blockquote.pull', async () => {
    const html = await process(':::pull\nA quote that stops you cold.\n:::')
    expect(html).toContain('<blockquote class="pull">')
    expect(html).toContain('A quote that stops you cold.')
    expect(html).toContain('</blockquote>')
  })

  it('supports inline content and leaves non-pull directives alone', async () => {
    const html = await process(
      ':::pull\nLegibility isn\'t a **style** — it\'s a posture.\n:::\n\n:::other\nx\n:::',
    )
    expect(html).toContain('<blockquote class="pull">')
    expect(html).toContain('<strong>style</strong>')
    // Non-pull directive is left in some untransformed/raw form — MUST NOT become blockquote.pull
    expect(html.match(/<blockquote class="pull">/g)?.length).toBe(1)
  })

  it('passes through plain markdown unchanged', async () => {
    const html = await process('Just a paragraph.')
    expect(html).toContain('<p>Just a paragraph.</p>')
    expect(html).not.toContain('blockquote')
  })
})
