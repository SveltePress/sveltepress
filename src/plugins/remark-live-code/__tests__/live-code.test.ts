import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import admonitions from 'remark-admonitions'
import liveCode from '..'

describe('live code', () => {
  it('tree.json', async () => {
    compile(
      readFileSync(new URL('+page.md', import.meta.url), 'utf-8'),
      {
        remarkPlugins: [liveCode, admonitions, () => {
          return (tree) => {
            expect(tree).toMatchSnapshot()
          }
        }],
      },
    ) || { code: '' }
  })

  it('+page.svelte', async () => {
    const { code } = await compile(
      readFileSync(new URL('+page.md', import.meta.url), 'utf-8'),
      {
        remarkPlugins: [liveCode, admonitions],
      },
    ) || { code: '' }
    expect(code).toMatchSnapshot()
  })
})
