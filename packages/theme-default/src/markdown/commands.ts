type Command = (params: string, lineIndex: number, lines: number) => string

export const COMMAND_RE = /\/\/ \[svp\! ((hl)|(~~)|(\+\+)|(--)|(df)|(fc)|(\!\!))(:\S+)?\]/

export const highlightLine: Command = (linesNumberToHighlight, idx, lines) => {
  const num = Number(linesNumberToHighlight)
  if (isNaN(num) || num < 1)
    return warpLine('svp-code-block--hl', idx)
  const max = lines - idx
  return Array.from({ length: num > max ? max : num }).map((_, i) => {
    const highlightIndex = i + idx
    return warpLine('svp-code-block--hl', highlightIndex)
  },
  ).join('\n')
}

export const diff: Command = (addOrCut, idx) => {
  const name = addOrCut === '-' ? 'sub' : 'add'
  const mark = addOrCut === '-' ? '-' : '+'
  return warpLine(
    `svp-code-block--diff-bg-${name}`,
    idx,
    `<div class="svp-code-block--diff-${name}">${mark}</div>`,
  )
}

export const focus: Command = (linesNumberToFocus, idx, lines) => {
  const num = Number(linesNumberToFocus)
  const wrapFocus = (top: string, height: string) =>
    `<div class="svp-code-block--focus" style="top: ${top};height: ${height};"></div>`
  const start = (isNaN(num) || num < 1) ? idx : idx + num - 1
  const res = [
    wrapFocus('0', `calc(12px + ${idx * 1.5}em)`),
  ]
  res.push(wrapFocus(`calc(12px + ${(start + 1) * 1.5}em)`, `calc(12px + ${(lines - start) * 1.5}em)`))

  return res.join('\n')
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
  // highlight
  'hl': highlightLine,
  '~~': highlightLine,

  // diff
  '++': diff,
  '--': (_p, i, lines) => diff('-', i, lines),
  'df': diff,

  // focus
  'fc': focus,
  '!!': focus,
}

function warpLine(classes: string, idx: number, content = '') {
  return `<div class="svp-code-block--command-line ${classes}"  style="top: calc(${idx * 1.5}em + 12px);">${content}</div>`
}
