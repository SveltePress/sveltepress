import type { BundledLanguage } from 'shiki/langs'
import type { BundledTheme, CodeToHastOptions } from 'shiki'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@sveltepress/vite'
import { LRUCache } from 'lru-cache'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '@sveltepress/twoslash'
import { themeOptionsRef } from '../index.js'
import { processCommands } from './commands.js'

const DEFAULT_SUPPORT_LANGUAGES: BundledLanguage[] = ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']

const cache = new LRUCache<string, any>({ max: 1024 })

async function createHighlighterWithThemeAndLangs() {
  const highlighterConfig = themeOptionsRef.value?.highlighter
  const langs = highlighterConfig?.languages || DEFAULT_SUPPORT_LANGUAGES
  const darkTheme = highlighterConfig?.themeDark ?? 'night-owl'
  const lightTheme = highlighterConfig?.themeLight ?? 'vitesse-light'
  const shikiHighlighter = await getHighlighter({
    themes: [darkTheme, lightTheme],
    langs,
  })

  const _highlighter: Highlighter = async (code, lang) => {
    const shikiOptions: CodeToHastOptions<BundledLanguage, BundledTheme> = {
      lang,
      themes: {
        dark: darkTheme,
        light: lightTheme,
      },
      transformers: [],
    }
    if (themeOptionsRef.value?.highlighter?.twoslash) {
      shikiOptions.transformers?.push(createTransformerFactory(await createTwoslasher())({
        langs: ['ts', 'tsx', 'svelte'],
        renderer: rendererFloatingSvelte({
          lang: 'ts',
        }),
      }))
    }
    return shikiHighlighter.codeToHtml(code, shikiOptions)
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
  }

  return _highlighter
}

const highlighterRef: {
  value?: Highlighter
} = {}

async function ensureHighlighter() {
  if (!highlighterRef.value)
    highlighterRef.value = await createHighlighterWithThemeAndLangs()
}

const highlighter: Highlighter = async (code, lang, meta) => {
  const cacheKey = JSON.stringify({ code, lang, meta })
  let cached = cache.get(cacheKey)
  if (cached)
    return cached
  await ensureHighlighter()
  const metaArray = (meta || '').split(' ')
  const containLineNumbers = metaArray.some(item => item.trim() === 'ln')
  const titleMeta = metaArray.find(item => item.startsWith('title='))
  const commandDoms: string[] = []
  const lines = code.split('\n')
  let noErrorsFirstLine: string | undefined
  if (lines[0] === '// @noErrors')
    noErrorsFirstLine = lines.shift()
  if (lang !== 'md') {
    code = lines.map((line, i) => {
      const [commandDomsInOneLine, newLine] = processCommands(line, i, lines.length)
      commandDoms.push(...commandDomsInOneLine)
      return newLine
    }).join('\n')
  }
  let title: string | undefined
  if (titleMeta)
    title = titleMeta.split('=')[1].replace(/(^")|("$)/g, '')
  if (noErrorsFirstLine)
    code = `${noErrorsFirstLine}\n${code}`

  cached = `
<div class="svp-code-block-wrapper">${title
? `<div class="svp-code-block--title">${title}</div>
`
: ''}
  <div class="svp-code-block${containLineNumbers ? ' svp-code-block--with-line-numbers' : ''}">
    ${commandDoms.join('\n')}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    ${await highlighterRef.value?.(code, lang, meta)}
    <div class="svp-code-block--lang">
      ${lang}
    </div>
    <CopyCode />
    ${containLineNumbers ? `<div class="svp-code-block--line-numbers">${lines.map((_, i) => `<div class="svp-code-block--line-number-item">${i + 1}</div>`).join('\n')}</div>` : ''}
  </div>
</div>`

  cache.set(cacheKey, cached)
  return cached
}

export default highlighter
