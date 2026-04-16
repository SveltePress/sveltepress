import { processCommands } from './commands.js'

export interface PreparedCodeBlock {
  /** Code with commands stripped, ready for Shiki. Includes @noErrors line if present. */
  processedCode: string
  /** Command overlay HTML divs */
  commandDoms: string[]
  /** Title from meta, if present */
  title?: string
  /** Whether line numbers were requested (ln in meta) */
  containLineNumbers: boolean
  /** Original lines array (commands stripped, @noErrors removed) — used for line number count */
  lines: string[]
  /** Whether @noErrors was present as first line */
  noErrors: boolean
}

export interface WrapCodeBlockOptions {
  /** HTML for the copy button. Omit to skip copy button. */
  copyButtonHtml?: string
  /** Escape { } to &#123; &#125; for Svelte compilation. Default: false */
  escapeForSvelte?: boolean
}

/**
 * Parse code block metadata and process code commands.
 * Call BEFORE Shiki highlighting.
 */
export function prepareCodeBlock(code: string, meta?: string): PreparedCodeBlock {
  const metaArray = (meta || '').split(' ')
  const containLineNumbers = metaArray.some(item => item.trim() === 'ln')
  const titleMeta = metaArray.find(item => item.startsWith('title='))

  let title: string | undefined
  if (titleMeta)
    title = titleMeta.split('=')[1].replace(/(^")|("$)/g, '')

  const commandDoms: string[] = []
  const lines = code.split('\n')

  let noErrors = false
  if (lines[0] === '// @noErrors') {
    noErrors = true
    lines.shift()
  }

  const processedLines = lines.map((line, i) => {
    const [commandDomsInOneLine, newLine] = processCommands(line, i, lines.length)
    commandDoms.push(...commandDomsInOneLine)
    return newLine
  })

  let processedCode = processedLines.join('\n')
  if (noErrors)
    processedCode = `// @noErrors\n${processedCode}`

  return {
    processedCode,
    commandDoms,
    title,
    containLineNumbers,
    lines,
    noErrors,
  }
}

/**
 * Wrap Shiki-highlighted HTML in the standard code block structure.
 * Call AFTER Shiki highlighting.
 */
export function wrapCodeBlock(
  highlightedHtml: string,
  lang: string,
  prepared: PreparedCodeBlock,
  options: WrapCodeBlockOptions = {},
): string {
  const { copyButtonHtml, escapeForSvelte = false } = options
  const { title, containLineNumbers, commandDoms, lines } = prepared

  let html = highlightedHtml
  if (escapeForSvelte) {
    html = html
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;')
  }

  const titleHtml = title
    ? `<div class="svp-code-block--title">${title}</div>\n`
    : ''

  const lineNumbersHtml = containLineNumbers
    ? `<div class="svp-code-block--line-numbers">${lines.map((_, i) => `<div class="svp-code-block--line-number-item">${i + 1}</div>`).join('\n')}</div>`
    : ''

  return `<div class="svp-code-block-wrapper">${titleHtml}<div class="svp-code-block${containLineNumbers ? ' svp-code-block--with-line-numbers' : ''}">
    ${commandDoms.join('\n')}
    ${html}
    <div class="svp-code-block--lang">${lang}</div>
    ${copyButtonHtml || ''}
    ${lineNumbersHtml}
  </div>
</div>`
}
