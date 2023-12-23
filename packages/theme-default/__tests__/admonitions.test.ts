import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import admonitions from '../src/markdown/admonitions'

const source = `---
foo: bar
---
:::note[Title]{icon=vscode-icons:file-type-svelte}
Some tip content
:::
`

describe('admonitions', () => {
  it('tip', async () => {
    const { code, data } = await mdToSvelte({
      filename: 'demo.md',
      mdContent: source,
      remarkPlugins: [admonitions],
    })

    expect(code).toMatchInlineSnapshot('"<div class="admonition admonition-note"><div class="admonition-heading"><span class="admonition-icon"><IconifyIcon collection="vscode-icons" name="file-type-svelte" /></span>Title</div><div class="admonition-content"><p>Some tip content</p></div></div>"')

    expect(data).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
  })
})
