import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getHighlighter } from 'shiki'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '../src'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')
const langs = ['ts', 'tsx', 'svelte']
const shikiHighlighter = await getHighlighter({
  themes: ['vitesse-dark', 'github-light'],
  langs,
})

describe('shiki', () => {
  it('twoslash svelte', async () => {
    const html = shikiHighlighter.codeToHtml(svelteCode, {
      lang: 'svelte',
      themes: {
        dark: 'vitesse-dark',
        light: 'github-light',
      },
      transformers: [
        createTransformerFactory(await createTwoslasher())({
          langs,
          renderer: rendererFloatingSvelte(),
        }),
      ],
    })
    expect(html).toMatchSnapshot()
  })

  it('tokens', () => {
    const tokens = shikiHighlighter.codeToTokensWithThemes(svelteCode, {
      themes: {
        dark: 'vitesse-dark',
        light: 'github-light',
      },
      lang: 'svelte',
    })
    expect(tokens).toMatchSnapshot()
  })
})
