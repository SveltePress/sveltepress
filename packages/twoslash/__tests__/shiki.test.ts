import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createTransformerFactory } from '@shikijs/twoslash'
import { codeToHtml, codeToTokensWithThemes } from 'shiki'
import { describe, expect, it } from 'vitest'
import { createTwoslasher, rendererFloatingSvelte } from '../src'

const svelteCode = readFileSync(resolve(import.meta.dirname, 'test.svelte'), 'utf-8')
const langs = ['ts', 'tsx', 'svelte']

describe('shiki', () => {
  it('twoslash svelte', async () => {
    const html = (await codeToHtml(svelteCode, {
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
    }))
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
      .replace(/<!--svp-snippet-start-->/g, '{#snippet floatingContent()}')
      .replace(/<!--svp-snippet-end-->/g, '{/snippet}')
    expect(html).toMatchFileSnapshot('test-result.svelte')
  })

  it('tokens', async () => {
    const tokens = await codeToTokensWithThemes(svelteCode, {
      themes: {
        dark: 'vitesse-dark',
        light: 'github-light',
      },
      lang: 'svelte',
    })
    expect(JSON.stringify(tokens, null, 2)).toMatchFileSnapshot('test-tokens.json')
  })
})
