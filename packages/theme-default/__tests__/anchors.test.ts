import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import anchors from '../src/markdown/anchors'

const md = `
## Foo \`foo\`

[foo](https://www.google.com/)
some content

### Bar

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
      <div id=\\"Foo foo\\" class=\\"svp-anchor-item\\"></div>
      <h2>Foo <code>foo</code></h2>
      <p><a href=\\"https://www.google.com/\\" rel=\\"nofollow\\">foo</a>
      some content</p>
      <div id=\\"Bar\\" class=\\"svp-anchor-item\\"></div>
      <h3>Bar</h3>
      <p>some other content</p>
      ",
        "data": {
          "anchors": [
            {
              "depth": 2,
              "slugId": "Foo foo",
              "title": "Foo foo",
            },
            {
              "depth": 3,
              "slugId": "Bar",
              "title": "Bar",
            },
          ],
        },
        "map": "",
      }
    `)
  })
})
