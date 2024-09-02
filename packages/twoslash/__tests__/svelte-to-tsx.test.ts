import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { svelte2tsx } from 'svelte2tsx'

const svelteFilePath = resolve(import.meta.dirname, 'test.svelte')
const svelteCode = readFileSync(svelteFilePath, 'utf-8')

describe('svelte to tsx', () => {
  it('tsx code', async () => {
    expect(svelte2tsx(svelteCode).code).toMatchSnapshot()
  })
})
