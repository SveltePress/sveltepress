import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import codeImport, { importRe } from '../src/markdown/code-import'
import highlighter from '../src/markdown/highlighter'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const mdPath = resolve(__dirname, 'code-import.md')
const mdContent = readFileSync(mdPath, 'utf-8')

describe('code import', async () => {
  it('existing and non-existing file', async () => {
    expect(mdContent).toMatchInlineSnapshot(`
      "## Title

      @code(./fake-file.ts)

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

  it('re tests', async () => {
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
