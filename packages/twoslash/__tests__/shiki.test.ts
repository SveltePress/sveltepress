import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { codeToHtml, codeToTokensWithThemes } from 'shiki'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '../src'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')
const langs = ['ts', 'tsx', 'svelte']

describe('shiki', () => {
  it('twoslash svelte', async () => {
    const html = await codeToHtml(svelteCode, {
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

  it('tokens', async () => {
    const tokens = await codeToTokensWithThemes(svelteCode, {
      themes: {
        dark: 'vitesse-dark',
        light: 'github-light',
      },
      lang: 'svelte',
    })
    expect(tokens).toMatchSnapshot()
  })
})
