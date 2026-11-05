import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'
import { remarkDisplayMath } from '../src/remark-display-math.js'

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkDisplayMath)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
    .then(vfile => String(vfile))
}

const display = (tex: string) => `<pre><code class="language-math math-display">${tex}</code></pre>`

describe('remarkDisplayMath', () => {
  it('turns a paragraph that is only $$…$$ into display math', async () => {
    expect(await process('$$O(n^2)$$')).toBe(display('O(n^2)'))
  })

  it('splits a $$…$$ line out of the text around it, like markdown-it-katex', async () => {
    const html = await process('优化完毕后，复杂度是：\n$$O(n)$$\n所以更快')
    expect(html).toBe(`<p>优化完毕后，复杂度是：</p>\n${display('O(n)')}\n<p>所以更快</p>`)
  })

  it('works inside list items', async () => {
    const html = await process('* 第一项:\n  $$a + b$$')
    expect(html).toContain('<li>第一项:\n<pre><code class="language-math math-display">a + b</code></pre>\n</li>')
  })

  it('leaves $$…$$ that shares its line with text inline', async () => {
    const html = await process('复杂度 $$O(n)$$ 而已')
    expect(html).toBe('<p>复杂度 <code class="language-math math-inline">O(n)</code> 而已</p>')
  })

  it('leaves single-dollar math inline even when alone on its line', async () => {
    expect(await process('$1 <= n <= 9$')).toBe('<p><code class="language-math math-inline">1 &#x3C;= n &#x3C;= 9</code></p>')
  })

  it('keeps fenced $$ blocks as they are', async () => {
    expect(await process('$$\nx = 1\n$$')).toBe(display('x = 1'))
  })
})
