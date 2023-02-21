import { describe, expect, it } from 'vitest'
import mdToSvelte from '../src/markdown/md-to-svelte'

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

    expect(data).toMatchInlineSnapshot('{}')
  })
})
