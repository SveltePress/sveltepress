type Command = (params: string, lineIndex: number, lines: number) => string

const BASE_LINE_CLASSES = 'absolute left-0 right-0 z-2 h-[1.5em]'
export const COMMAND_RE = /\/\/ \[svp\! ((hl)|(~~)|(\+\+)|(--)|(df))(:\S+)?\]/

export const highlightLine: Command = (linesNumberToHighlight, idx, lines) => {
  const num = Number(linesNumberToHighlight)
  if (isNaN(num) || num < 1)
    return warpLine('bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-10', idx)
  const max = lines - idx
  return Array.from({ length: num > max ? max : num }).map((_, i) => {
    const highlightIndex = i + idx
    return warpLine('bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-10', highlightIndex)
  },
  ).join('\n')
}

export const diff: Command = (addOrCut, idx) => {
  const color = addOrCut === '-' ? 'rose' : 'green'
  const mark = addOrCut === '-' ? '-' : '+'
  return warpLine(
    `bg-${color}-4 bg-opacity-20`,
    idx,
    `<div class="absolute left-[4px] top-0 bottom-0 h-full text-${color}-4">${mark}</div>`,
  )
}

export const focus: Command = (linesNumberToFocus, idx) => {

}

export const getCommand = (line: string) => {
  const matches = COMMAND_RE.exec(line)
  if (matches && matches.length) {
    const [comment] = matches
    // [svp! command:param1,params2] => command:param1,params2
    return [comment.replace(/^\/\/ \[svp\! /, '').replace(/\]$/, ''), line.replace(COMMAND_RE, '')]
  }

  return ['', line]
}

export const COMMAND_CHEAT_LIST: Record<string, Command> = {
  'hl': highlightLine,
  '~~': highlightLine,
  '++': diff,
  '--': (_p, i, lines) => diff('-', i, lines),
  'df': diff,
}

function warpLine(classes: string, idx: number, content = '') {
  return `<div class="${BASE_LINE_CLASSES} ${classes}"  style="top: calc(${idx * 1.5}em + 12px);">${content}</div>`
}
