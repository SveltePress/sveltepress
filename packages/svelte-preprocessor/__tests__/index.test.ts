import { readFileSync, writeFileSync } from 'fs'
import { preprocess } from 'svelte/compiler'
import { describe, expect, it } from 'vitest'
import sveltepressPreprocessor from '../src'

describe('sveltepress-preprocessor', () => {
  it('preprocess', async () => {
    const res = await preprocess(
      readFileSync(new URL('+page.md', import.meta.url), 'utf-8'),
      sveltepressPreprocessor({}),
      {
        filename: '+page.md',
      },
    )
    expect(res).toMatchSnapshot()
    writeFileSync(new URL('+page.svelte', import.meta.url), res.code)
  })
})
