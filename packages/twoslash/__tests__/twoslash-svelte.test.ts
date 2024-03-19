import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTwoslasher } from '../src'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')

const twoslasher = await createTwoslasher()

describe('shiki', () => {
  it('twoslash svelte hover', async () => {
    expect(twoslasher(svelteCode, 'svelte').hovers).toMatchSnapshot()
  })
})
