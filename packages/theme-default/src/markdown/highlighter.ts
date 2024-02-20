import type { BundledLanguage } from 'shiki/langs'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@sveltepress/vite'
import { LRUCache } from 'lru-cache'
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
  const highlighter: Highlighter = (code, lang) => shikiHighlighter.codeToHtml(code, {
    lang,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
  })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
  return highlighter
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

  cached = `
<div class="svp-code-block-wrapper">${title
? `<div class="svp-code-block--title">${title}</div>
`
: ''}
  <div class="svp-code-block${containLineNumbers ? ' svp-code-block--with-line-numbers' : ''}">
    ${commandDoms.join('\n')}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    ${await highlighterRef.value?.(code, lang)}
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
