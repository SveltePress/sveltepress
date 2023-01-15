import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import anchors from '../src/markdown/anchors'

const md = `
## Foo

[foo](https://www.google.com/)
some content

## Bar

some other content

`

describe('anchors', () => {
  it('simple', async () => {
    const r = await compile(md, {
      remarkPlugins: [anchors, () => (tree) => {
        expect(JSON.stringify(tree, null, 2)).toMatchSnapshot()
      }],
    })
    expect(r).toMatchInlineSnapshot(`
      {
        "code": "
      <div id=\\"slug-1\\" class=\\"relative bottom-[74px]\\"></div>
      <h2>Foo</h2>
      <p><a href=\\"https://www.google.com/\\" rel=\\"nofollow\\">foo</a>
      some content</p>
      <div id=\\"slug-2\\" class=\\"relative bottom-[74px]\\"></div>
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
