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

  // Distinct token colours in the output: plain text renders in one colour.
  function tokenColors(html: string): Set<string> {
    return new Set([...html.matchAll(/style="color:(#[0-9A-Fa-f]{6})/g)].map(m => m[1]))
  }

  it.each([
    ['vue', '<template>\n  <div :class="cls">{{ msg }}</div>\n</template>\n<script>\nexport default { data() { return { msg: \'hi\' } } }\n</script>'],
    ['java', 'public class A {\n  private int x = 1;\n  public static void main(String[] args) {}\n}'],
    ['php', '<?php\n$foo = function () use (&$bar) { return 1; };'],
    ['python', 'def f(x):\n    return x + 1  # comment'],
    ['lisp', '(defun double (x) (* x 2)) ; comment'],
    ['sql', 'SELECT id, name FROM users WHERE id = 1;'],
    ['xml', '<?xml version="1.0"?>\n<project><version>1.0</version></project>'],
    ['less', '@color: #fff;\n.a { color: @color; }'],
    ['stylus', '.a\n  color red\n  &:hover\n    color blue'],
    ['yml', 'key: value\nlist:\n  - 1'],
    ['Java', 'public class A {}'],
  ])('highlights %s, which is not preloaded', async (lang, code) => {
    const html = await process(`\`\`\`${lang}\n${code}\n\`\`\``)
    expect(html).toContain(`>${lang}<`)
    expect(tokenColors(html).size).toBeGreaterThan(1)
  })

  it('renders an unknown language as plain text', async () => {
    const html = await process('```not-a-language\nfoo bar\n```')
    expect(html).toContain('class="shiki')
    expect(tokenColors(html).size).toBeLessThan(2)
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
