import type { VersionManifest } from '@sveltepress/vite/versioning'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mdToSvelte } from '@sveltepress/vite'
import { compilePageArtifactModule } from '@sveltepress/vite/versioning'
import { describe, expect, it } from 'vitest'
import anchors from '../src/markdown/anchors'
import componentImports from '../src/markdown/component-imports'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'
import installPkg from '../src/markdown/install-pkg'
import liveCode from '../src/markdown/live-code'
import versionChanges from '../src/markdown/version-changes'

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

  it('keeps markdown live source as markdown-only highlighting', async () => {
    const source = [
      '````md live',
      '```js',
      'const value = 1 // [svp! hl]',
      '```',
      '````',
    ].join('\n')

    const { code } = await mdToSvelte({
      filename: 'markdown-live.md',
      mdContent: source,
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(code.match(/svp-live-code--container/g)).toHaveLength(1)
    expect(code.match(/<Expansion codeType="md"/g)).toHaveLength(1)
    expect(code.match(/svp-code-block--hl/g)).toHaveLength(1)
    expect(code).toContain('svp! hl')
  })

  it('associates a version marker after a live-code example with its preceding heading', async () => {
    const manifest: VersionManifest = {
      basePath: '/v',
      current: { id: '2026-08-31', label: '2026-08-31' },
      versions: [{ id: '2026-08-28', label: '2026-08-28' }],
      content: { include: ['**'], exclude: [], shared: [] },
    }
    const source = [
      '## Focus',
      '',
      'Use focus commands in code blocks.',
      '',
      ':::since[Multiple focus ranges]{version="2026-08-31" id="multiple-focus-ranges"}',
      'Multiple focus commands can appear in one code block.',
      '',
      '````md live',
      '```html',
      '<h1>Focused</h1>',
      '```',
      '````',
      ':::',
      '',
      '## Markdown live code',
      '',
      ':::since[Literal Markdown source]{version="2026-08-31" id="literal-markdown-live-source"}',
      '````md live',
      '### Title',
      '````',
      ':::',
    ].join('\n')

    const { data } = await mdToSvelte({
      filename: 'versioned-live-code.md',
      mdContent: source,
      remarkPlugins: [liveCode, versionChanges({ manifest }), anchors],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(data.anchors).toEqual([
      {
        slugId: 'Focus',
        title: 'Focus',
        depth: 2,
        versionChangeId: 'multiple-focus-ranges',
      },
      {
        slugId: 'Markdown-live-code',
        title: 'Markdown live code',
        depth: 2,
        versionChangeId: 'literal-markdown-live-source',
      },
      {
        slugId: 'Title',
        title: 'Title',
        depth: 3,
      },
    ])
  })

  it('does not compile nested svelte live blocks from markdown live code', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-markdown-live-source-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    const source = [
      '````md live',
      '```svelte live',
      '<button>Nested demo</button>',
      '```',
      '````',
    ].join('\n')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, source)

    const artifact = await compilePageArtifactModule({
      filename,
      source,
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
    })

    expect(Object.keys(artifact.files).filter(path => path.startsWith('generated/live-code/'))).toEqual([])
    expect(String(artifact.files['client.js'])).not.toContain('page-artifact-generated/live-code/')
  })

  it('keeps no-ast markdown live source as markdown-only highlighting', async () => {
    const source = [
      '````md live no-ast',
      '```js',
      'const value = 1 // [svp! hl]',
      '```',
      '````',
    ].join('\n')

    const { code } = await mdToSvelte({
      filename: 'markdown-live-no-ast.md',
      mdContent: source,
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
      highlighter,
    })

    expect(code.match(/svp-code-block--hl/g)).toHaveLength(1)
    expect(code).toContain('svp! hl')
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
      rehypePlugins: [componentImports],
      highlighter,
    }) || { code: '' }

    expect(code).toMatchSnapshot()
  })

  it('embeds svelte live code in reusable page artifacts', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-live-code-artifact-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    const source = `# Guide

\`\`\`svelte live
<button>Artifact demo</button>
\`\`\`
`
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, source)

    const artifact = await compilePageArtifactModule({
      filename,
      source,
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
    })

    const generated = Object.keys(artifact.files).filter(path => path.startsWith('generated/live-code/'))
    expect(generated).toHaveLength(1)
    expect(String(artifact.files[generated[0]])).toBe('<button>Artifact demo</button>')
    expect(String(artifact.files['client.js'])).toContain('virtual:sveltepress/page-artifact-generated/live-code/')
    expect(String(artifact.files['client.js'])).not.toContain('/.sveltepress/live-code/')
  })

  it('deduplicates stable generated files across sync and async live code blocks', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-deduplicated-live-code-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    const demo = '<button>Same demo</button>'
    const source = [
      '# Guide',
      '',
      '```svelte live',
      demo,
      '```',
      '',
      '```svelte live',
      demo,
      '```',
      '',
      '```svelte live async',
      demo,
      '```',
    ].join('\n')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, source)

    const artifact = await compilePageArtifactModule({
      filename,
      source,
      remarkPlugins: [liveCode],
      rehypePlugins: [componentImports],
    })

    expect(Object.keys(artifact.files).filter(path => path.startsWith('generated/live-code/'))).toHaveLength(1)
    expect(String(artifact.files['client.js']).match(/page-artifact-generated\/live-code\//g)).toHaveLength(2)
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
