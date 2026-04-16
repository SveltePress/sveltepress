import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { beforeAll, describe, expect, it } from 'vitest'
import { initHighlighter } from '../src/highlighter.js'
import { remarkCodeBlocks } from '../src/remark-code-blocks.js'

beforeAll(async () => {
  await initHighlighter()
})

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkCodeBlocks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('remarkCodeBlocks', () => {
  it('highlights a basic code block', async () => {
    const md = '```ts\nconst x = 1\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block-wrapper')
    expect(html).toContain('svp-code-block--lang')
    expect(html).toContain('>ts<')
    expect(html).toContain('class="shiki')
  })

  it('adds title when meta contains title=', async () => {
    const md = '```ts title="config.ts"\nconst x = 1\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--title')
    expect(html).toContain('config.ts')
  })

  it('adds line numbers when meta contains ln', async () => {
    const md = '```ts ln\nconst a = 1\nconst b = 2\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--with-line-numbers')
    expect(html).toContain('svp-code-block--line-numbers')
    expect(html).toContain('>1<')
    expect(html).toContain('>2<')
  })

  it('processes highlight commands', async () => {
    const md = '```ts\nconst x = 1 // [svp! hl]\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--hl')
    // Command should be stripped from rendered code
    expect(html).not.toContain('[svp! hl]')
  })

  it('processes diff commands', async () => {
    const md = '```ts\nconst added = 1 // [svp! ++]\nconst removed = 2 // [svp! --]\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--diff-bg-add')
    expect(html).toContain('svp-code-block--diff-bg-sub')
  })

  it('includes copy button', async () => {
    const md = '```ts\ncode\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--copy-btn')
  })

  it('does not escape curly braces (blog uses {@html})', async () => {
    const md = '```ts\nconst x = { a: 1 }\n```'
    const html = await process(md)
    // The Shiki output may contain { } in syntax tokens — they should NOT be escaped
    expect(html).not.toContain('&#123;')
  })

  it('leaves non-code content untouched', async () => {
    const md = '# Hello\n\nSome text.\n\n```ts\ncode\n```\n\nMore text.'
    const html = await process(md)
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<p>Some text.</p>')
    expect(html).toContain('svp-code-block-wrapper')
    expect(html).toContain('<p>More text.</p>')
  })
})
