import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import highlighter from '../src/markdown/highlighter'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')

describe('twoslash', () => {
  it('renderer floating svelte', async () => {
    const code = `
const num = 1

const foo = 'bar'

`

    expect(await highlighter(code, 'ts')).toMatchSnapshot()
  })

  it('twoslash svelte', async () => {
    expect(await highlighter(svelteCode, 'svelte')).toMatchSnapshot()
  })
})
