import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { rehypeFigure } from '../src/rehype-figure.js'

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFigure)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('rehypeFigure', () => {
  it('wraps an image-only paragraph into a figure with figcaption from alt', async () => {
    const html = await process('![A readable diff is cheap docs.](/img.png)')
    expect(html).toContain('<figure>')
    expect(html).toContain('<img')
    expect(html).toContain('src="/img.png"')
    expect(html).toContain('alt="A readable diff is cheap docs."')
    expect(html).toContain('<figcaption>A readable diff is cheap docs.</figcaption>')
    expect(html).toContain('</figure>')
    // The original paragraph wrapper must be gone
    expect(html).not.toMatch(/<p>\s*<img/)
  })

  it('skips images without alt text', async () => {
    const html = await process('![](/img.png)')
    expect(html).not.toContain('<figure>')
    expect(html).not.toContain('<figcaption>')
    expect(html).toContain('<img')
  })

  it('skips paragraphs that also contain text', async () => {
    const html = await process('Text before ![caption](/img.png) text after.')
    expect(html).not.toContain('<figure>')
    expect(html).toContain('<img')
  })

  it('handles multiple figure paragraphs in one doc', async () => {
    const html = await process(
      '![First.](/a.png)\n\nSome prose.\n\n![Second.](/b.png)',
    )
    expect(html.match(/<figure>/g)?.length).toBe(2)
    expect(html).toContain('<figcaption>First.</figcaption>')
    expect(html).toContain('<figcaption>Second.</figcaption>')
  })
})
