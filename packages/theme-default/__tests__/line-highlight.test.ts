import { describe, expect, it } from 'vitest'
import highlighter from '../src/markdown/highlighter'

describe('line highlight', () => {
  it('single line', async () => {
    const source = `<script>
  let count = 0 // [svp! hl]
</script>

<button on:click="{() => count++}">
  You've clicked {count} times.
</button>
`
    expect(await highlighter(source, 'svelte')).toMatchSnapshot()
  })
})
