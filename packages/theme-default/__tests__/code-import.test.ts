import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import codeImport, { importRe } from '../src/markdown/code-import'
import highlighter from '../src/markdown/highlighter'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const mdPath = resolve(__dirname, 'code-import.md')
const mdContent = readFileSync(mdPath, 'utf-8')

describe('code import', async () => {
  it('import example', async () => {
    expect(mdContent).toMatchInlineSnapshot(`
      "## Title

      @code(./svelte.test.ts)

      @code(/src/index.ts,20,37)"
    `)

    const { code } = await mdToSvelte({
      mdContent,
      filename: mdPath,
      highlighter,
      remarkPlugins: [codeImport],
    })
    expect(code).toMatchSnapshot()
  })

  it('re tests', () => {
    const matches = importRe.exec('@code(./foo/bar/Comp.svelte,10,20)')
    expect(matches).toMatchInlineSnapshot(`
      [
        "@code(./foo/bar/Comp.svelte,10,20)",
        "./foo/bar/Comp.svelte,10,20",
        undefined,
        undefined,
      ]
    `)
  })
})
