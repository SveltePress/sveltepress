import { resolve } from 'path'
import { readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { compile } from 'svelte/compiler'

describe('svelte compile', () => {
  it('expansion', async () => {
    expect(
      compile(
        readFileSync(
          resolve(process.cwd(), 'src/components/CExpansion.svelte'), 'utf-8')).js.code).toMatchSnapshot()
  })
})
