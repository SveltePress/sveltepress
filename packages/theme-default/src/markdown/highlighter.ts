import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Lang } from 'shiki'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@sveltepress/vite'
import { LRUCache } from 'lru-cache'
import { themeOptionsRef } from '../index.js'
import { processCommands } from './commands.js'

const DEFAULT_SUPPORT_LANGUAGES: Lang[] = ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']

const cache = new LRUCache<string, any>({ max: 1024 })

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nightOwl = JSON.parse(readFileSync(resolve(__dirname, './night-owl.json'), 'utf-8'))
const vitesseLight = JSON.parse(readFileSync(resolve(__dirname, './vitesse-light.json'), 'utf-8'))

async function createHighlighterWithThemeAndLangs(theme: any, langs: Lang[]) {
  const shikiHighlighter = await getHighlighter({
    theme,
    langs,
  })
  const highlighter: Highlighter = (code, lang) => shikiHighlighter.codeToHtml(code, { lang })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
  return highlighter
}

const highlighterRef: {
  light?: Highlighter
  dark?: Highlighter
} = {}

async function ensureHighlighter() {
  const highlighterConfig = themeOptionsRef.value?.highlighter
  const languages = highlighterConfig?.languages || DEFAULT_SUPPORT_LANGUAGES

  if (!highlighterRef.dark)
    highlighterRef.dark = await createHighlighterWithThemeAndLangs(highlighterConfig?.themeDark || nightOwl, languages)

  if (!highlighterRef.light)
    highlighterRef.light = await createHighlighterWithThemeAndLangs(highlighterConfig?.themeLight || vitesseLight, languages)
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
    ${await highlighterRef.light?.(code, lang)}
    ${await highlighterRef.dark?.(code, lang)}
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
