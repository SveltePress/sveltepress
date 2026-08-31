import { describe, expect, it } from 'vitest'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'

describe('line highlight', async () => {
  await initHighlighter()

  it('single line', async () => {
    const source = `<script>
  let count = $state(0) // [svp! hl]
</script>

<button onclick="{() => count++}">
  You've clicked {count} times.
</button>
`
    expect(await highlighter(source, 'svelte')).toMatchSnapshot()
  })

  it('keeps code commands enabled for ordinary markdown code blocks', async () => {
    const html = await highlighter('const value = 1 // [svp! hl]', 'md')

    expect(html.match(/svp-code-block--hl/g)).toHaveLength(1)
    expect(html).not.toContain('svp! hl')
  })
})
