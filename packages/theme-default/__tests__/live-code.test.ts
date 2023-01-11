import { resolve } from 'path'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import { compile as svCompile } from 'svelte/compiler'
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

describe('svelte compile', () => {
  it('expansion', async () => {
    expect(svCompile(readFileSync(resolve(process.cwd(), 'src/components/CExpansion.svelte'), 'utf-8')).js).toMatchSnapshot()
  })
})
