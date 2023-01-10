import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import liveCode from '../src/markdown/live-code'

const md = `
### title level 3
<script context="module">
  const a = 'a'
  export const b = 'b'
</script>
<script>
  import Foo from '/path/to/Foo.svelte'
</script>

<Foo />

\`\`\`svelte live
<script>
  let count = 1
</script>

<button on:click={() => count++}>
  You've clicked {count} times
</button>
\`\`\`
`

describe('live code', () => {
  it('simple parse', async () => {
    const { code } = await compile(md, {
      remarkPlugins: [liveCode],
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  })
})
