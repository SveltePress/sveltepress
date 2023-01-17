import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { compile } from 'mdsvex'
import codeImport from '../src/markdown/code-import'
import highlighter from '../src/markdown/highlighter'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const mdPath = resolve(__dirname, 'code-import.md')
const mdContent = readFileSync(mdPath, 'utf-8')

describe('code import', async () => {
  it('import example', async () => {
    expect(mdContent).toMatchInlineSnapshot(`
      "## Title

      @code(./svelte.test.ts)

      @code(/src/index.ts)"
    `)

    const { code } = await compile(mdContent, {
      filename: mdPath,
      extensions: ['.md'],
      highlight: {
        highlighter,
      },
      remarkPlugins: [codeImport],
    }) || { code: '' }
    expect(code).toMatchSnapshot()
  })
})
