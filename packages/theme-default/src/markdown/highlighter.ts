import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@sveltepress/vite'
import LRUCache from 'lru-cache'
import { processCommands } from './commands.js'
const cache = new LRUCache<string, any>({ max: 1024 })

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nightOwl = JSON.parse(readFileSync(resolve(__dirname, './night-owl.json'), 'utf-8'))
const vitesseLight = JSON.parse(readFileSync(resolve(__dirname, './vitesse-light.json'), 'utf-8'))

const createHighlightWithTheme: (theme: string) => Highlighter = theme => (code, lang) => getHighlighter({
  theme,
  langs: ['svelte', 'sh', 'js', 'html', 'ts', 'md'],
}).then(
  shikiHighlighter => shikiHighlighter
    .codeToHtml(code, { lang })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;'),
)

const highlighterDark = createHighlightWithTheme(nightOwl)

const highlighterLight = createHighlightWithTheme(vitesseLight)

const highlighter: Highlighter = async (code, lang, meta) => {
  const cacheKey = JSON.stringify({ code, lang, meta })
  let cached = cache.get(cacheKey)
  if (cached)
    return cached
  const metaArray = (meta || '').split(' ')
  const containLineNumbers = metaArray.some(item => item.trim() === 'ln')
  const titleMeta = metaArray.find(item => item.startsWith('title='))
  const commandDoms = []
  const lines = code.split('\n')
  if (lang !== 'md') {
    code = lines.map((line, i) => {
      const [commandDomsInOneLine, newLine] = processCommands(line, i, lines.length)
      commandDoms.push(...commandDomsInOneLine)
      return newLine
    }).join('\n')
  }
  let title: string
  if (titleMeta)
    title = titleMeta.split('=')[1].replace(/(^")|("$)/g, '')

  cached = `
<div class="svp-code-block-wrapper">${title
? `<div class="svp-code-block--title">${title}</div>
`
: ''}
  <div class="svp-code-block${containLineNumbers ? ' svp-code-block--with-line-numbers' : ''}">
    ${commandDoms.join('\n')}
    ${await highlighterLight(code, lang)}
    ${await highlighterDark(code, lang)}
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
