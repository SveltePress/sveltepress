import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import componentImports from '../src/markdown/component-imports'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'
import installPkg from '../src/markdown/install-pkg'
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
      rehypePlugins: [componentImports],
      highlighter,
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  }, 10000)

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
      rehypePlugins: [componentImports],
      highlighter,
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  })

  it('does not couple plain markdown to unused theme components', async () => {
    const { code } = await mdToSvelte({
      filename: 'plain.md',
      mdContent: '# Plain page\n\nNo enhanced components.',
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(code).not.toContain('@sveltepress/theme-default/components')
    expect(code).not.toContain('@sveltepress/twoslash/FloatingWrapper.svelte')
  })

  it('imports only theme components present in the generated page', async () => {
    const { code } = await mdToSvelte({
      filename: 'tabs.md',
      mdContent: '<Tabs><TabPanel title="One">One</TabPanel></Tabs>',
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(code).toContain('import { Tabs, TabPanel } from \'@sveltepress/theme-default/components\'')
    expect(code).not.toContain('Expansion')
    expect(code).not.toContain('CopyCode')
  })

  it('detects components created by asynchronous remark transforms', async () => {
    const { code } = await mdToSvelte({
      filename: 'install.md',
      mdContent: '@install-pkg(svelte)',
      remarkPlugins: [installPkg],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(code).toContain('import { CopyCode, InstallPkg } from \'@sveltepress/theme-default/components\'')
    expect(code).toContain('<InstallPkg>')
  })
})
