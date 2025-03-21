import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { highlighter, initHighlighter } from '@sveltepress/theme-default'
import { describe, expect, it } from 'vitest'
import mdToSvelte from '../src/markdown/md-to-svelte'
import { wrapPage } from '../src/utils/wrap-page'

const source = `---
title: Page Title
description: Some page description
---

### Hi

Hello, world!

- 1
- 2

\`\`\`js
const a = 'a'
function hello(msg) {
  console.log('Hello ', msg)
}
\`\`\`

<script>
  import Counter from './Counter.svelte'
  let count = $state(0)
</script>

{#snippet someSnippet()}
  something
{/snippet}

<div>
  <button onclick={() => count++}>
    You've clicked {count} times
  </button>
</div>

{@render someSnippet()}

<style>
  .foo {
    color: blue;
  }
</style>
`

describe('md to svelte', () => {
  it('complex demo', async () => {
    const { code, data } = await mdToSvelte({
      mdContent: source,
      filename: 'simple.md',
    })

    expect(code).toMatchInlineSnapshot(`
      "<h3>Hi</h3>
      <p>Hello, world!</p>
      <ul>
      <li>1</li>
      <li>2</li>
      </ul>
      <pre><code class="language-js">const a = 'a'
      function hello(msg) {
        console.log('Hello ', msg)
      }
      </code></pre>
      <script>
        import Counter from './Counter.svelte'
        let count = $state(0)
      </script>
      {#snippet someSnippet()}
      something
      {/snippet}
      <div>
        <button onclick={() => count++}>
          You've clicked {count} times
        </button>
      </div>
      {@render someSnippet()}
      <style>
        .foo {
          color: blue;
        }
      </style>"
    `)

    expect(data).toMatchInlineSnapshot(`
      {
        "description": "Some page description",
        "title": "Page Title",
      }
    `)
  })

  it('wrap page layout', async () => {
    const code = await wrapPage({
      mdOrSvelteCode: source,
      id: '/foo/+page.md',
      layout: '/path/to/CustomLayout.svelte',
      highlighter: (code, lang) => Promise.resolve(`<div>${lang}</div><div>${code}</div>`),
    })
    expect(code).toMatchInlineSnapshot(`
      {
        "fm": {
          "description": "Some page description",
          "lastUpdate": "Invalid Date",
          "pageType": "md",
          "title": "Page Title",
        },
        "wrappedCode": "<script>
      import PageLayout from '/path/to/CustomLayout.svelte'
      const fm = {"pageType":"md","lastUpdate":"Invalid Date","title":"Page Title","description":"Some page description"}
        import Counter from './Counter.svelte'
        let count = $state(0)
      </script>

      <PageLayout {fm}><h3>Hi</h3>
      <p>Hello, world!</p>
      <ul>
      <li>1</li>
      <li>2</li>
      </ul>
      <div>js</div><div>const a = 'a'
      function hello(msg) {
        console.log('Hello ', msg)
      }</div>

      {#snippet someSnippet()}
      something
      {/snippet}
      <div>
        <button onclick={() => count++}>
          You've clicked {count} times
        </button>
      </div>
      {@render someSnippet()}
      </PageLayout>
      <style>
        .foo {
          color: blue;
        }
      </style>
      ",
      }
    `)
  })

  it('real world', async () => {
    await initHighlighter({
      twoslash: true,
    })
    const mdContent = readFileSync(resolve(cwd(), '../docs-site/src/routes/guide/default-theme/twoslash/+page.md'), 'utf-8')
    const { code } = await mdToSvelte({
      mdContent,
      filename: 'real-world.md',
      highlighter,
    })
    expect(code).toMatchFileSnapshot('real-world.svelte')
  })
})
