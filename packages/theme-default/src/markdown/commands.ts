type Command = (params: string, lineIndex: number) => string

const BASE_LINE_CLASSES = 'absolute left-0 right-0 z-2 h-[1.5em]'
export const COMMAND_RE = /\/\/ \[svp\! ((hl)|(~~)|(\+\+)|(--)|(df))(:\S+)?\]/

export const highlightLine: Command = (startEnd, idx) => {
  // TODO: support for hl:1,10 like patterns
  if (!startEnd)
    return warpLine('bg-black dark:bg-white bg-opacity-10', idx)
}

export const diff: Command = (addOrCut, idx) => {
  if (!addOrCut || addOrCut === '+') {
    return warpLine(
      'bg-green-4 bg-opacity-20',
      idx,
      '<div class="absolute left-[4px] top-0 bottom-0 h-full text-green-4">+</div>',
    )
  }

  if (addOrCut === '-') {
    return warpLine(
      'bg-rose-4 bg-opacity-20',
      idx,
      '<div class="absolute left-[4px] top-0 bottom-0 h-full text-rose-4">-</div>',
    )
  }

  return ''
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
  '--': (p, i) => diff('-', i),
  'df': diff,
}

function warpLine(classes: string, idx: number, content = '') {
  return `<div class="${BASE_LINE_CLASSES} ${classes}"  style="top: calc(${idx * 1.5}em + 12px);">${content}</div>`
}
