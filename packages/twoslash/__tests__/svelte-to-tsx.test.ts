import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { svelte2tsx } from 'svelte2tsx'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')

describe('shiki', () => {
  it('twoslash svelte', async () => {
    const { code } = svelte2tsx(svelteCode)
    expect(code).toMatchSnapshot()
  })
})
