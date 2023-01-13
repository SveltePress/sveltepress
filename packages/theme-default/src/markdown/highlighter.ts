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
    code = code.split('\n').map((line, i) => {
      const [command, newLine] = getCommand(line)
      if (!command)
        return line

      const [name, params] = command.split(':')
      const commandExecutor = COMMAND_CHEAT_LIST[name]
      if (commandExecutor)
        commandDoms.push(commandExecutor(params, i))

      return newLine
    }).join('\n')
  }
  return `<div class="relative bg-white dark:bg-[#011627] py-[12px] px-18px rounded text-[14px]">
      ${commandDoms.join('\n')}
      ${await highlighterLight(code, lang)}
      ${await highlighterDark(code, lang)}
      <div class="absolute top-2 right-3 text-cool-gray-3 dark:text-cool-gray-7 text-[12px] z-2">
        ${lang}
      </div>
  </div>`
}

export default highlighter
