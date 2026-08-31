import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { rehypeBasePath } from '../src/rehype-base-path.js'

function render(markdown: string, base: string) {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeBasePath, { base })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(markdown)
    .toString()
}

describe('rehypeBasePath', () => {
  it('prefixes site-absolute image sources and links', () => {
    const html = render('![alt](/covers/diff.svg)\n\n[read on](/posts/hello/)', '/blog/')

    expect(html).toContain('src="/blog/covers/diff.svg"')
    expect(html).toContain('href="/blog/posts/hello/"')
  })

  it('leaves absolute and protocol-relative URLs alone', () => {
    const html = render('![alt](https://example.com/a.png)\n\n![cdn](//cdn.example.com/a.png)', '/blog')

    expect(html).toContain('src="https://example.com/a.png"')
    expect(html).toContain('src="//cdn.example.com/a.png"')
  })

  it('leaves relative paths, fragments, and mail links alone', () => {
    const html = render('![alt](./a.png)\n\n[up](../) [top](#intro) [mail](mailto:a@b.c)', '/blog')

    expect(html).toContain('src="./a.png"')
    expect(html).toContain('href="../"')
    expect(html).toContain('href="#intro"')
    expect(html).toContain('href="mailto:a@b.c"')
  })

  it('is a no-op at the site root and does not prefix twice', () => {
    expect(render('![alt](/covers/diff.svg)', ''))
      .toContain('src="/covers/diff.svg"')
    expect(render('![alt](/blog/covers/diff.svg)', '/blog'))
      .toContain('src="/blog/covers/diff.svg"')
  })
})
