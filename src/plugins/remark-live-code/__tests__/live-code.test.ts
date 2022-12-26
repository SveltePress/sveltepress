import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, it } from 'vitest'
import { compile } from 'mdsvex'
import admonitions from 'remark-admonitions'
import liveCode from '..'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

describe('live code', () => {
  it('1', async () => {
    const { code } = await compile(
      readFileSync(new URL('+page.md', import.meta.url), 'utf-8'),
      {
        remarkPlugins: [liveCode, admonitions, () => {
          return (tree) => {
            writeFileSync(resolve(__dirname, 'tree.json'), JSON.stringify(tree))
          }
        }],
      },
    ) || { code: '' }
    writeFileSync(resolve(__dirname, '+page.svelte'), code)
  })
})
