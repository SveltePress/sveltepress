import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import links from '../src/markdown/links'

const md = `
## Foo

[foo](https://www.google.com/)
[bar](/foo/bar)
[\`with inline code\`](/foo/bar)

`

describe('links', () => {
  it('simple', async () => {
    const r = await mdToSvelte({
      mdContent: md,
      filename: 'demo.md',
      remarkPlugins: [links, () => (tree) => {
        expect(JSON.stringify(tree, null, 2)).toMatchSnapshot()
      }],
    })
    expect(r).toMatchInlineSnapshot(`
      {
        "code": "<h2>Foo</h2>
      <p><Link to="https://www.google.com/">{#snippet labelRenderer()}foo{/snippet}</Link>
      <Link to="/foo/bar">{#snippet labelRenderer()}bar{/snippet}</Link>
      <Link to="/foo/bar">{#snippet labelRenderer()}<code>{\`with inline code\`}</code>{/snippet}</Link></p>",
        "data": {},
      }
    `)
  })
})
