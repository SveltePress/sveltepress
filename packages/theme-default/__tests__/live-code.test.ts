import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'
import liveCode from '../src/markdown/live-code'

const md = `
### title level 3
<script module>
  const a = 'a'
  export const b = 'b'
</script>
<script>
  import Foo from '/path/to/Foo.svelte'
</script>

<Foo />

\`\`\`svelte live
<script>
  let count = $state(0)
</script>

<button onclick={() => count++}>
  You've clicked {count} times
</button>
\`\`\`

\`\`\`svelte live
<script>
  let count = $state(0)
</script>

<button onclick={() => count++}>
  You've clicked {count} times
</button>
\`\`\`

\`\`\`md live
### title

* list item1
* list item2
[Google](https://google.com)
\`\`\`

\`\`\`\`md live no-ast
### title

:::tip[Tip title]{icon=custom:icon}
This is a tip
:::

\`\`\`svelte
<script>
  let count = $state(0)
</script>

<button onclick={() => count++}>
  You've clicked {count} times
</button>
\`\`\`
\`\`\`\`
`

describe('live code', async () => {
  await initHighlighter({
    twoslash: true,
  })
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
