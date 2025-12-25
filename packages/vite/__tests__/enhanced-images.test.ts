import { describe, expect, it } from 'vitest'
import mdToSvelte from '../src/markdown/md-to-svelte'

const sourceWithImage = `---
title: Page with Image
---

# Image Test

![Alt text](./test.jpg)

Some content after.
`

describe('enhanced images', () => {
  it('transforms image nodes to enhanced:img elements', async () => {
    const { code } = await mdToSvelte({
      mdContent: sourceWithImage,
      filename: 'image-test.md',
    })

    expect(code).toMatchInlineSnapshot(`
      "<h1>Image Test</h1>
      <p><enhanced:img src="./test.jpg" alt="Alt text" /></p>
      <p>Some content after.</p>"
    `)
  })

  it('handles images with titles', async () => {
    const sourceWithTitle = `---
title: Page with Image
---

# Image Test

![Alt text](./test.jpg "Image Title")

Some content after.
`

    const { code } = await mdToSvelte({
      mdContent: sourceWithTitle,
      filename: 'image-test.md',
    })

    expect(code).toMatchInlineSnapshot(`
      "<h1>Image Test</h1>
      <p><enhanced:img src="./test.jpg" alt="Alt text" title="Image Title" /></p>
      <p>Some content after.</p>"
    `)
  })

  it('handles images without alt text', async () => {
    const sourceNoAlt = `---
title: Page with Image
---

# Image Test

![](./test.jpg)

Some content after.
`

    const { code } = await mdToSvelte({
      mdContent: sourceNoAlt,
      filename: 'image-test.md',
    })

    expect(code).toMatchInlineSnapshot(`
      "<h1>Image Test</h1>
      <p><enhanced:img src="./test.jpg" /></p>
      <p>Some content after.</p>"
    `)
  })
})
