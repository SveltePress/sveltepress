import type { BundledLanguage, BundledTheme, CodeToHastOptions, HighlighterGeneric } from 'shiki'
import type { HighlighterOptions } from './types.js'
import { env } from 'node:process'
import { LRUCache } from 'lru-cache'
import { createHighlighter } from 'shiki'

const DEFAULT_LANGUAGES: BundledLanguage[] = [
  'svelte',
  'sh',
  'bash',
  'js',
  'javascript',
  'ts',
  'typescript',
  'html',
  'css',
  'scss',
  'json',
  'md',
  'yaml',
  'jsx',
  'tsx',
]

const cache = new LRUCache<string, string>({ max: 200 })

let instance: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null
let darkTheme: BundledTheme = 'night-owl'
let lightTheme: BundledTheme = 'vitesse-light'
let twoslashTransformer: any = null

/**
 * Initialise the Shiki highlighter singleton.
 * Called in the Vite plugin's `buildStart` hook.
 */
export async function initHighlighter(config: HighlighterOptions = {}): Promise<void> {
  darkTheme = (config.themeDark ?? 'night-owl') as BundledTheme
  lightTheme = (config.themeLight ?? 'vitesse-light') as BundledTheme

  const extra = (config.languages ?? []) as BundledLanguage[]
  const langs = [...new Set([...DEFAULT_LANGUAGES, ...extra])]

  const themes: BundledTheme[] = [darkTheme, lightTheme]

  instance = await createHighlighter({ langs, themes })

  if (config.twoslash) {
    const { createTransformerFactory } = await import('@shikijs/twoslash')
    const { rendererRich } = await import('@shikijs/twoslash')
    twoslashTransformer = createTransformerFactory({})({
      langs: ['ts', 'tsx'],
      renderer: rendererRich(),
    })
  }
}

/**
 * Highlight code with Shiki. Returns an HTML string with dual-theme inline styles.
 * Uses LRU cache in development mode.
 */
export function highlight(code: string, lang?: string): string {
  const cacheKey = `${lang}:${code}`
  if (env.NODE_ENV === 'development') {
    const cached = cache.get(cacheKey)
    if (cached)
      return cached
  }

  if (!instance)
    throw new Error('[theme-blog] Shiki highlighter not initialised — call initHighlighter() first')

  const language = (lang || 'text') as BundledLanguage
  const loadedLangs = instance.getLoadedLanguages()
  const resolvedLang = loadedLangs.includes(language) ? language : 'text'

  const options: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang: resolvedLang,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
    transformers: twoslashTransformer ? [twoslashTransformer] : [],
  }

  const result = instance.codeToHtml(code, options)

  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, result)

  return result
}
