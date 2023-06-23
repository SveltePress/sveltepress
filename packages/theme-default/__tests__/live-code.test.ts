import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import liveCode from '../src/markdown/live-code'
import highlighter from '../src/markdown/highlighter'

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

\`\`\`md live
### title

* list item1
* list item2
[Google](https://google.com)
\`\`\`
`

describe('live code', () => {
  it('simple parse', async () => {
    const { code } = await mdToSvelte({
      filename: 'demo.md',
      mdContent: md,
      remarkPlugins: [liveCode],
      highlighter,
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  })

  it('async svelte live code', async () => {
    const source = `---
title: Test Page
---

\`\`\`svelte live async
<h1>This is a async svelte live code</h1>
\`\`\`
`
    const { code } = await mdToSvelte({
      filename: 'demo.md',
      mdContent: source,
      remarkPlugins: [liveCode],
      highlighter,
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  })
})
