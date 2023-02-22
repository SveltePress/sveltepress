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
`

describe('md to svelte', () => {
  it('simple', async () => {
    const { code, data } = await mdToSvelte({
      mdContent: source,
    })

    expect(code).toMatchInlineSnapshot(`
      "<h3>Hi</h3>
      <p>Hello, world!</p>
      <ul>
      <li>1</li>
      <li>2</li>
      </ul>"
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
      const fm = {\\"pageType\\":\\"md\\",\\"lastUpdate\\":\\"Invalid Date\\",\\"title\\":\\"Page Title\\",\\"description\\":\\"Some page description\\"}
      </script>

      <PageLayout {fm}><h3>Hi</h3>
      <p>Hello, world!</p>
      <ul>
      <li>1</li>
      <li>2</li>
      </ul></PageLayout>

      ",
      }
    `)
  })
})
