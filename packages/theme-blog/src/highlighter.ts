import type { BundledLanguage, BundledTheme, CodeToHastOptions, HighlighterGeneric } from 'shiki'
import type { HighlighterOptions } from './types.js'
import { env } from 'node:process'
import { LRUCache } from 'lru-cache'
import { bundledLanguages, createHighlighter } from 'shiki'

/** Preloaded at startup; any other Shiki-bundled language loads on first use. */
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
/** In-flight / finished on-demand loads, so concurrent posts share one load per language. */
let pendingLoads = new Map<string, Promise<void>>()

/**
 * Map a fence language to a name the highlighter knows: as written, else
 * lower-cased (`Java`, `PHP`), else `text`.
 */
function resolveLanguage(lang: string | undefined, loaded: string[]): string {
  if (!lang)
    return 'text'
  if (loaded.includes(lang))
    return lang
  const lower = lang.toLowerCase()
  return loaded.includes(lower) ? lower : 'text'
}

/**
 * Load every Shiki-bundled language in `langs` that isn't loaded yet, so a
 * post can use any language Shiki ships (vue, java, php, python, lisp, sql,
 * xml, less, stylus …) without listing it in `highlighter.languages`.
 * Unknown names are ignored and render as plain text.
 */
export async function ensureLanguages(langs: Iterable<string | null | undefined>): Promise<void> {
  const wanted = new Set([...langs].filter((l): l is string => !!l))
  if (!wanted.size)
    return
  if (!instance)
    throw new Error('[theme-blog] Shiki highlighter not initialised — call initHighlighter() first')
  const highlighter = instance
  const loaded = new Set(highlighter.getLoadedLanguages())
  const loads: Promise<void>[] = []
  for (const raw of wanted) {
    if (loaded.has(raw))
      continue
    const name = raw in bundledLanguages ? raw : raw.toLowerCase()
    if (loaded.has(name) || !(name in bundledLanguages))
      continue
    let load = pendingLoads.get(name)
    if (!load) {
      load = highlighter.loadLanguage(name as BundledLanguage)
      pendingLoads.set(name, load)
    }
    loads.push(load)
  }
  await Promise.all(loads)
}

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
  pendingLoads = new Map()

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

  const resolvedLang = resolveLanguage(lang, instance.getLoadedLanguages())

  const options: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang: resolvedLang as BundledLanguage,
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
