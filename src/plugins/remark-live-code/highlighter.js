import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { getHighlighter } from 'shiki'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nightOwl = JSON.parse(readFileSync(resolve(__dirname, './night-owl.json'), 'utf-8'))

/**
 *
 * @param {string} code
 * @param {string=} lang
 * @returns
 */
const hilighter = (code, lang) => getHighlighter({
  theme: nightOwl,
}).then(
  shikiHilighter => shikiHilighter
    .codeToHtml(code, { lang })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;'),
)

export default hilighter
