import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DocumentSnapshot } from 'svelte-language-server/dist/src/plugins/typescript/DocumentSnapshot'
import { parse } from 'svelte/compiler'
import { Document } from 'svelte-language-server/dist/src/lib/documents'

const svelteFilePath = resolve(import.meta.dirname, 'test.svelte')
const svelteCode = readFileSync(svelteFilePath, 'utf-8')

describe('svelte to tsx', () => {
  const doc = DocumentSnapshot.fromDocument(new Document('index.svelte', svelteCode), {
    parse,
    version: '4',
    transformOnTemplateError: false,
    typingsNamespace: '',
  })
  it('tsx code', async () => {
    expect(doc.getFullText()).toMatchSnapshot()
    expect(doc.getOriginalPosition({
      line: 2,
      character: 15,
    })).toMatchInlineSnapshot(`
      {
        "character": 15,
        "line": 1,
      }
    `)
  })
})
