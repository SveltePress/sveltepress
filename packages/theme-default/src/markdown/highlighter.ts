import type { Highlighter } from '@sveltepress/vite'
import type { BundledTheme, CodeToHastOptions, HighlighterGeneric } from 'shiki'
import type { BundledLanguage } from 'shiki/langs'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { env } from 'node:process'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '@sveltepress/twoslash'
import { prepareCodeBlock, wrapCodeBlock } from '@sveltepress/vite/highlight'
import { LRUCache } from 'lru-cache'
import { createHighlighter } from 'shiki'
import { themeOptionsRef } from '../index.js'

const DEFAULT_SUPPORT_LANGUAGES: any[] = ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']

const cache = new LRUCache<string, any>({ max: 200 })

const shikiHighlighterInstance: {
  value: null | HighlighterGeneric<BundledLanguage, BundledTheme>
  twoslashTransformer?: any
} = {
  value: null,
}

const _highlighter: Highlighter = async (code, lang) => {
  const highlighterConfig = themeOptionsRef.value?.highlighter
  const darkTheme = highlighterConfig?.themeDark ?? 'night-owl'
  const lightTheme = highlighterConfig?.themeLight ?? 'vitesse-light'

  const shikiOptions: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
    transformers: [],
  }
  if (shikiHighlighterInstance.twoslashTransformer) {
    shikiOptions.transformers?.push(
      shikiHighlighterInstance.twoslashTransformer,
    )
  }
  const { codeToHtml } = shikiHighlighterInstance.value!
  return codeToHtml(code, shikiOptions)
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/<!--svp-floating-snippet-start-->/g, '{#snippet floatingContent()}')
    .replace(/<!--svp-floating-snippet-end-->/g, '{/snippet}')
}

const highlighter: Highlighter = async (code, lang, meta) => {
  const cacheKey = JSON.stringify({ code, lang, meta })
  let cached
  if (env.NODE_ENV === 'development') {
    cached = cache.get(cacheKey)
    if (cached)
      return cached
  }

  const prepared = prepareCodeBlock(code, meta)

  cached = wrapCodeBlock(
    await _highlighter(prepared.processedCode, lang, meta),
    lang,
    prepared,
    {
      copyButtonHtml: `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->\n    <CopyCode />`,
    },
  )

  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, cached)
  return cached
}

export async function initHighlighter(highlighterConfig: DefaultThemeOptions['highlighter'] = {}) {
  const langs = highlighterConfig?.languages || DEFAULT_SUPPORT_LANGUAGES
  const darkTheme = highlighterConfig?.themeDark ?? 'night-owl'
  const lightTheme = highlighterConfig?.themeLight ?? 'vitesse-light'
  shikiHighlighterInstance.value = await createHighlighter({
    langs,
    themes: [darkTheme, lightTheme],
  })
  if (highlighterConfig.twoslash) {
    shikiHighlighterInstance.twoslashTransformer = createTransformerFactory(
      await createTwoslasher(highlighterConfig.twoslash === true
        ? {
            compilerOptions: {
              jsx: 1,
              types: ['@sveltepress/vite/types', '@sveltepress/theme-default/types', '@sveltepress/theme-default/components', '@sveltejs/kit'],
            },
          }
        : highlighterConfig.twoslash),
    )(
      {
        langs: ['ts', 'tsx', 'svelte'],
        renderer: rendererFloatingSvelte(),
      },
    )
  }
}

export default highlighter
