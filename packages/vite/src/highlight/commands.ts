type Command = (params: string, lineIndex: number, lines: number) => string | string[]

export interface FocusRange {
  start: number
  end: number
}

interface ProcessCommandsOptions {
  focusRanges?: FocusRange[]
}

export const COMMAND_RE = /\/\/ \[svp! ((hl)|(~~)|(\+\+)|(--)|(df)|(fc)|(!!))(:\S+)?\]/

export const highlightLine: Command = (linesNumberToHighlight, idx, lines) => {
  const num = Number(linesNumberToHighlight)
  if (Number.isNaN(num) || num < 1)
    return warpLine('svp-code-block--hl', idx)
  const max = lines - idx
  return Array.from({ length: num > max ? max : num }).map((_, i) => {
    const highlightIndex = i + idx
    return warpLine('svp-code-block--hl', highlightIndex)
  })
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
  return renderFocusRanges([toFocusRange(linesNumberToFocus, idx, lines)], lines).join('\n')
}

export function renderFocusRanges(ranges: FocusRange[], lines: number): string[] {
  if (!ranges.length)
    return []

  const mergedRanges = ranges
    .toSorted((a, b) => a.start - b.start)
    .reduce<FocusRange[]>((merged, range) => {
      const previous = merged.at(-1)
      if (previous && range.start <= previous.end + 1)
        previous.end = Math.max(previous.end, range.end)
      else
        merged.push({ ...range })
      return merged
    }, [])

  const overlays = [
    wrapFocus('0', `calc(12px + ${mergedRanges[0].start * 1.5}em)`),
  ]

  for (let i = 1; i < mergedRanges.length; i++) {
    const previous = mergedRanges[i - 1]
    const current = mergedRanges[i]
    const gapLines = current.start - previous.end - 1
    overlays.push(wrapFocus(
      `calc(12px + ${(previous.end + 1) * 1.5}em)`,
      `${gapLines * 1.5}em`,
    ))
  }

  const lastRange = mergedRanges.at(-1)!
  overlays.push(wrapFocus(
    `calc(12px + ${(lastRange.end + 1) * 1.5}em)`,
    `calc(12px + ${(lines - lastRange.end - 1) * 1.5}em)`,
  ))
  return overlays
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

export const processCommands: (
  line: string,
  lineIndex: number,
  lineLength: number,
  options?: ProcessCommandsOptions,
) => [string[], string] = (line, lineIndex, lineLength, options = {}) => {
  const commandDoms: string[] = []
  let newLine = line
  const re = /\/\/ \[svp! ((hl)|(~~)|(\+\+)|(--)|(df)|(fc)|(!!))(:\S+)?\]/g
  let matches = re.exec(line)

  while (matches && matches.length) {
    const [commandRaw] = matches
    const command = commandRaw.replace(/^\/\/ \[svp! /, '').replace(/\]$/, '')
    const [name, params] = command.split(':')
    const commandExecutor = COMMAND_CHEAT_LIST[name]
    if (commandExecutor) {
      if (commandExecutor === focus && options.focusRanges) {
        options.focusRanges.push(toFocusRange(params, lineIndex, lineLength))
      }
      else {
        const result = commandExecutor(params, lineIndex, lineLength)
        if (Array.isArray(result))
          commandDoms.push(...result)
        else
          commandDoms.push(result)
      }
    }

    const idx = newLine.indexOf(commandRaw)
    newLine = `${newLine.slice(0, idx)}${newLine.slice(idx + commandRaw.length)}`

    matches = re.exec(line)
  }
  return [commandDoms, newLine]
}

function toFocusRange(linesNumberToFocus: string, idx: number, lines: number): FocusRange {
  const num = Number(linesNumberToFocus)
  const count = (Number.isNaN(num) || num < 1) ? 1 : num
  return {
    start: idx,
    end: Math.min(idx + count - 1, lines - 1),
  }
}

function wrapFocus(top: string, height: string) {
  return `<div class="svp-code-block--focus" style="top: ${top};height: ${height};"></div>`
}

function warpLine(classes: string, idx: number, content = '') {
  return `<div class="svp-code-block--command-line ${classes}"  style="top: calc(${idx * 1.5}em + 12px);">${content}</div>`
}
