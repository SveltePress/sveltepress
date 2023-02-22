import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import admonitions from '../src/markdown/admonitions'

const source = `---
foo: bar
---
:::note[Title]{a=b}
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

    expect(code).toMatchInlineSnapshot('"<div class=\\"admonition admonition-note\\"><div class=\\"admonition-heading\\"><h5><span class=\\"admonition-icon\\"><svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"32\\" height=\\"32\\" viewBox=\\"0 0 24 24\\"><path fill=\\"currentColor\\" d=\\"M7 17h2.1l6-5.95l-2.15-2.15L7 14.85Zm8.8-6.65l1.05-1.1Q17 9.1 17 8.9q0-.2-.15-.35l-1.4-1.4Q15.3 7 15.1 7q-.2 0-.35.15l-1.1 1.05ZM5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h4.2q.325-.9 1.088-1.45Q11.05 1 12 1t1.713.55Q14.475 2.1 14.8 3H19q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm7-14.75q.325 0 .538-.213q.212-.212.212-.537q0-.325-.212-.538q-.213-.212-.538-.212q-.325 0-.537.212q-.213.213-.213.538q0 .325.213.537q.212.213.537.213ZM5 19V5v14Z\\"/></svg></span>Title</h5></div><div class=\\"admonition-content\\"><p>Some tip content</p></div></div>"')

    expect(data).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
  })
})
