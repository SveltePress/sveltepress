import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import anchors from '../src/markdown/anchors'

const md = `
## Foo

some content

## Bar

some other content

`

describe('anchors', () => {
  it('simple', async () => {
    const r = await compile(md, {
      remarkPlugins: [anchors],
    })
    expect(r).toMatchInlineSnapshot(`
      {
        "code": "
      <div id=\\"slug-1\\"></div>
      <h2>Foo</h2>
      <p>some content</p>
      <div id=\\"slug-2\\"></div>
      <h2>Bar</h2>
      <p>some other content</p>
      ",
        "data": {
          "anchors": [
            {
              "slugId": "slug-1",
              "title": "Foo",
            },
            {
              "slugId": "slug-2",
              "title": "Bar",
            },
          ],
        },
        "map": "",
      }
    `)
  })
})
