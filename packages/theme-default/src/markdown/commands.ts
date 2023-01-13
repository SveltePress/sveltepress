type Command = (params: string, lineIndex: number) => string
export const COMMAND_RE = /\/\/ \[svp\! (hl(:-?\d+(,-?\d+)?)?)\]/

export const highlightLine: Command = (startEnd: string, idx: number) => {
  if (!startEnd)
    return `<div class="absolute left-0 right-0 z-2 h-[1.5em] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] svp-code-highlight-line" style="top: calc(${idx * 1.5}em + 12px);"></div>`
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
