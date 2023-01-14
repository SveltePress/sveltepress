import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { getHighlighter } from 'shiki'
import type { Highlighter } from '@svelte-press/vite'
import { COMMAND_CHEAT_LIST, getCommand } from './commands.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nightOwl = JSON.parse(readFileSync(resolve(__dirname, './night-owl.json'), 'utf-8'))
const vitesseLight = JSON.parse(readFileSync(resolve(__dirname, './vitesse-light.json'), 'utf-8'))

const createHighlightWith: (theme: string) => Highlighter = theme => (code, lang) => getHighlighter({
  theme,
  langs: ['svelte', 'sh', 'js', 'html', 'ts', 'md'],
}).then(
  shikiHighlighter => shikiHighlighter
    .codeToHtml(code, { lang })
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;'),
)

const highlighterDark = createHighlightWith(nightOwl)

const highlighterLight = createHighlightWith(vitesseLight)

const highlighter: Highlighter = async (code, lang) => {
  const commandDoms = []
  if (lang !== 'md') {
    const lines = code.split('\n')
    code = lines.map((line, i) => {
      const [command, newLine] = getCommand(line)
      if (!command)
        return line

      const [name, params] = command.split(':')
      const commandExecutor = COMMAND_CHEAT_LIST[name]
      if (commandExecutor)
        commandDoms.push(commandExecutor(params, i, lines.length))

      return newLine
    }).join('\n')
  }
  return `<div class="svp-code-block">
      ${commandDoms.join('\n')}
      ${await highlighterLight(code, lang)}
      ${await highlighterDark(code, lang)}
      <div class="svp-code-block--lang">
        ${lang}
      </div>
  </div>`
}

export default highlighter
