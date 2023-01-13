import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@svelte-press/vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const COMMAND_RE = /\/\/ \[svp\! (hl(:-?\d+(,-?\d+)?)?)\]/

const nightOwl = JSON.parse(readFileSync(resolve(__dirname, './night-owl.json'), 'utf-8'))
const vitesseLight = JSON.parse(readFileSync(resolve(__dirname, './vitesse-light.json'), 'utf-8'))

const createHighlightWith: (theme: string) => Highlighter = theme => (code, lang) => getHighlighter({
  theme,
  langs: ['svelte', 'sh', 'js', 'html', 'ts'],
}).then(
  shikiHighlighter => shikiHighlighter
    .codeToHtml(code, { lang })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;'),
)

const highlighterDark = createHighlightWith(nightOwl)

const highlighterLight = createHighlightWith(vitesseLight)

export function getCommand(line: string) {
  const matches = COMMAND_RE.exec(line)
  if (matches && matches.length) {
    const [comment] = matches
    return [comment.replace(/^\/\/ \[svp\! /, '').replace(/\]$/, ''), line.replace(COMMAND_RE, '')]
  }

  return ['', line]
}

export function highlightLine(startEnd: string, idx: number) {
  if (!startEnd)
    return `<div class="absolute left-0 right-0 z-2 h-[1.5em] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] svp-code-highlight-line" style="top: calc(${idx * 1.5}em + 12px);"></div>`
}

const highlighter: Highlighter = async (code, lang) => {
  const commandDoms = []
  if (lang !== 'md') {
    code = code.split('\n').map((line, i) => {
      const [command, newLine] = getCommand(line)
      if (!command)
        return line

      const [name, params] = command.split(':')
      switch (name) {
        case 'hl':
          commandDoms.push(highlightLine(params, i))
      }
      return newLine
    }).join('\n')
  }
  return `<div class="relative bg-white dark:bg-[#011627] p-[12px] rounded text-[14px]">
      ${commandDoms.join('\n')}
      ${await highlighterLight(code, lang)}
      ${await highlighterDark(code, lang)}
      <div class="absolute top-2 right-3 text-cool-gray-3 dark:text-cool-gray-7 text-[12px] z-2">
        ${lang}
      </div>
  </div>`
}

export default highlighter
