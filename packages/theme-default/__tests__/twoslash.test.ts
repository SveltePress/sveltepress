import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import highlighter, { initHighlighter } from '../src/markdown/highlighter'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')

describe('twoslash', async () => {
  await initHighlighter({
    twoslash: true,
  })
  it('renderer floating svelte', async () => {
    const code = `
import { sveltekit } from '@sveltejs/kit/vite' // [svp! --]
import { sveltepress } from '@sveltepress/vite' // [svp! ++]
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({}), // [svp! ++]
    sveltekit(), // [svp! --]
  ],
})

export default config
`

    expect(await highlighter(code, 'ts')).toMatchSnapshot()
  })

  it('twoslash svelte', async () => {
    expect(await highlighter(svelteCode, 'svelte')).toMatchSnapshot()
  })
})
