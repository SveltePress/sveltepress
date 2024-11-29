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
})
