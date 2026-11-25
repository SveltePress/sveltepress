import type { Highlighter } from '@sveltepress/vite'
import type { BundledTheme, CodeToHastOptions, HighlighterGeneric } from 'shiki'
import type { BundledLanguage } from 'shiki/langs'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { env } from 'node:process'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '@sveltepress/twoslash'
import { prepareCodeBlock, wrapCodeBlock } from '@sveltepress/vite/highlight'
import { LRUCache } from 'lru-cache'
import { bundledLanguages, createHighlighter } from 'shiki'
import { themeOptionsRef } from '../index.js'
import { resolveShikiThemes } from '../shiki-themes.js'

/**
 * Loaded when the highlighter starts. Any other language shiki bundles is
 * loaded the first time a code block uses it.
 */
const DEFAULT_SUPPORT_LANGUAGES: any[] = ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']

/** Names shiki renders without loading a grammar. */
const PLAIN_LANGUAGES = new Set(['text', 'plaintext', 'txt', 'plain', 'ansi'])

const cache = new LRUCache<string, any>({ max: 200 })

const shikiHighlighterInstance: {
  value: null | HighlighterGeneric<BundledLanguage, BundledTheme>
  twoslashTransformer?: any
} = {
  value: null,
}

/** In-flight and finished on-demand loads, so pages compiled in parallel share one load per language. */
let pendingLoads = new Map<string, Promise<void>>()
const warnedLanguages = new Set<string>()

/**
 * Map the language of a code fence to a name the highlighter can use, loading
 * its grammar when shiki bundles it but it is not loaded yet. Names are tried
 * as written and then in lower case (`Python`, `YML`). A name shiki does not
 * know renders as plain text instead of failing the whole build.
 */
async function resolveLanguage(lang?: string | null): Promise<string> {
  if (!lang)
    return 'text'
  const lower = lang.toLowerCase()
  if (PLAIN_LANGUAGES.has(lower))
    return lower

  const highlighter = shikiHighlighterInstance.value!
  const loaded = highlighter.getLoadedLanguages()
  // An array, not a Set: svelte-package compiles this file to ES5, where
  // `for...of` over a Set never runs its body.
  const candidates = lower === lang ? [lang] : [lang, lower]
  for (const name of candidates) {
    if (loaded.includes(name))
      return name
    if (name in bundledLanguages) {
      let load = pendingLoads.get(name)
      if (!load) {
        load = highlighter.loadLanguage(name as BundledLanguage)
        pendingLoads.set(name, load)
      }
      await load
      return name
    }
  }

  if (!warnedLanguages.has(lang)) {
    warnedLanguages.add(lang)
    console.warn(`[@sveltepress/theme-default] Unknown code block language "${lang}": rendered as plain text. Shiki lists the names it knows at https://shiki.style/languages`)
  }
  return 'text'
}

const _highlighter: Highlighter = async (code, lang) => {
  const shikiOptions: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang: await resolveLanguage(lang),
    themes: resolveShikiThemes(themeOptionsRef.value?.highlighter),
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

  const prepared = prepareCodeBlock(
    code,
    meta,
    lang === 'md' && meta?.split(' ').includes('live')
      ? { mode: 'literal' }
      : undefined,
  )

  const themeOptions = themeOptionsRef.value
  const collapseAfterLines = themeOptions?.highlighter?.codeCollapseLines ?? 30

  cached = wrapCodeBlock(
    await _highlighter(prepared.processedCode, lang, meta),
    lang,
    prepared,
    {
      copyButtonHtml: `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->\n    <CopyCode />`,
      collapseAfterLines: collapseAfterLines || undefined,
      expandLabel: themeOptions?.i18n?.expandCode || 'Expand code',
    },
  )

  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, cached)
  return cached
}

export async function initHighlighter(highlighterConfig: DefaultThemeOptions['highlighter'] = {}) {
  const langs = highlighterConfig?.languages || DEFAULT_SUPPORT_LANGUAGES
  const { dark, light } = resolveShikiThemes(highlighterConfig)
  shikiHighlighterInstance.value = await createHighlighter({
    langs,
    themes: [dark, light],
  })
  pendingLoads = new Map()
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
