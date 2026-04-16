# Blog Theme Shiki Highlighting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full Shiki code block highlighting to `@sveltepress/theme-blog`, sharing core logic via `@sveltepress/vite/highlight`.

**Architecture:** Extract `commands.ts` and a new `code-block.ts` (prepare + wrap utilities) into `@sveltepress/vite`. Refactor `theme-default` to import from there. Blog theme uses a remark-level plugin that calls shared utilities and wraps output with its own copy button (plain HTML + event delegation).

**Tech Stack:** Shiki 3.x, unified/remark/rehype, LRU cache, Vitest, TypeScript

**Working directory:** `/Users/zhaodongsheng/my-projects/sveltepress/.worktrees/theme-blog/` (on `feature/theme-blog` branch)

**Important:** All file paths below are relative to the worktree root. The worktree is at `/Users/zhaodongsheng/my-projects/sveltepress/.worktrees/theme-blog/`.

---

## Phase 1: Shared Code in `@sveltepress/vite`

### Task 1: Create `commands.ts` in vite package

**Files:**
- Create: `packages/vite/src/highlight/commands.ts`
- Test: `packages/vite/__tests__/commands.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// packages/vite/__tests__/commands.test.ts
import { describe, expect, it } from 'vitest'
import { COMMAND_RE, processCommands } from '../src/highlight/commands'

describe('code commands', () => {
  it('detects highlight command', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:10]')).toBeTruthy()
  })

  it('detects diff commands', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! ++]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! --]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df]')).toBeTruthy()
  })

  it('detects focus commands', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! fc]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! !!]')).toBeTruthy()
  })

  it('does not match non-commands', () => {
    expect(COMMAND_RE.test('const foo = 1')).toBeFalsy()
    expect(COMMAND_RE.test('// normal comment')).toBeFalsy()
  })

  it('processCommands strips command and returns overlay HTML', () => {
    const [doms, newLine] = processCommands('const foo = 1 // [svp! hl]', 0, 5)
    expect(newLine).toBe('const foo = 1 ')
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--hl')
    expect(doms[0]).toContain('top: calc(0em + 12px)')
  })

  it('highlight with count', () => {
    const [doms, newLine] = processCommands('const x = 1 // [svp! hl:3]', 2, 10)
    expect(newLine).toBe('const x = 1 ')
    expect(doms).toHaveLength(3)
    expect(doms[0]).toContain('top: calc(3em + 12px)') // line 2
    expect(doms[1]).toContain('top: calc(4.5em + 12px)') // line 3
    expect(doms[2]).toContain('top: calc(6em + 12px)') // line 4
  })

  it('diff add', () => {
    const [doms] = processCommands('added // [svp! ++]', 1, 5)
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--diff-bg-add')
    expect(doms[0]).toContain('svp-code-block--diff-add')
    expect(doms[0]).toContain('+')
  })

  it('diff remove', () => {
    const [doms] = processCommands('removed // [svp! --]', 1, 5)
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--diff-bg-sub')
    expect(doms[0]).toContain('svp-code-block--diff-sub')
    expect(doms[0]).toContain('-')
  })

  it('focus', () => {
    const [doms] = processCommands('focused // [svp! fc]', 2, 5)
    expect(doms).toHaveLength(1)
    // Focus produces two overlay divs joined by newline
    expect(doms[0]).toContain('svp-code-block--focus')
  })

  it('multiple commands on one line', () => {
    const [doms, newLine] = processCommands(
      'const foo = 1 // [svp! ++] // [svp! ~~]',
      0,
      1,
    )
    expect(newLine).toBe('const foo = 1  ')
    expect(doms).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/vite && npx vitest run __tests__/commands.test.ts`
Expected: FAIL — module `../src/highlight/commands` not found

- [ ] **Step 3: Create the commands module**

```typescript
// packages/vite/src/highlight/commands.ts
type Command = (params: string, lineIndex: number, lines: number) => string

export const COMMAND_RE = /\/\/ \[svp! ((hl)|(~~)|(\+\+)|(--)|(df)|(fc)|(!!))(:\S+)?\]/

export const highlightLine: Command = (linesNumberToHighlight, idx, lines) => {
  const num = Number(linesNumberToHighlight)
  if (Number.isNaN(num) || num < 1)
    return warpLine('svp-code-block--hl', idx)
  const max = lines - idx
  return Array.from({ length: num > max ? max : num }).map((_, i) => {
    const highlightIndex = i + idx
    return warpLine('svp-code-block--hl', highlightIndex)
  }).join('\n')
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
  const start = (Number.isNaN(num) || num < 1) ? idx : idx + num - 1
  const res = [
    wrapFocus('0', `calc(12px + ${idx * 1.5}em)`),
  ]
  res.push(wrapFocus(`calc(12px + ${(start + 1) * 1.5}em)`, `calc(12px + ${(lines - start - 1) * 1.5}em)`))
  return res.join('\n')
}

export const COMMAND_CHEAT_LIST: Record<string, Command> = {
  'hl': highlightLine,
  '~~': highlightLine,
  '++': diff,
  '--': (_p, i, lines) => diff('-', i, lines),
  'df': diff,
  'fc': focus,
  '!!': focus,
}

export const processCommands: (
  line: string,
  lineIndex: number,
  lineLength: number,
) => [string[], string] = (line, lineIndex, lineLength) => {
  const commandDoms: string[] = []
  let newLine = line
  const re = /\/\/ \[svp! ((hl)|(~~)|(\+\+)|(--)|(df)|(fc)|(!!))(:\S+)?\]/g
  let matches = re.exec(line)

  while (matches && matches.length) {
    const [commandRaw] = matches
    const command = commandRaw.replace(/^\/\/ \[svp! /, '').replace(/\]$/, '')
    const [name, params] = command.split(':')
    const commandExecutor = COMMAND_CHEAT_LIST[name]
    if (commandExecutor)
      commandDoms.push(commandExecutor(params, lineIndex, lineLength))

    const idx = newLine.indexOf(commandRaw)
    newLine = `${newLine.slice(0, idx)}${newLine.slice(idx + commandRaw.length)}`

    matches = re.exec(line)
  }
  return [commandDoms, newLine]
}

function warpLine(classes: string, idx: number, content = '') {
  return `<div class="svp-code-block--command-line ${classes}"  style="top: calc(${idx * 1.5}em + 12px);">${content}</div>`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/vite && npx vitest run __tests__/commands.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vite/src/highlight/commands.ts packages/vite/__tests__/commands.test.ts
git commit -m "feat(vite): add shared code commands module to highlight utilities"
```

---

### Task 2: Create `code-block.ts` in vite package

**Files:**
- Create: `packages/vite/src/highlight/code-block.ts`
- Test: `packages/vite/__tests__/code-block.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// packages/vite/__tests__/code-block.test.ts
import { describe, expect, it } from 'vitest'
import { prepareCodeBlock, wrapCodeBlock } from '../src/highlight/code-block'

describe('prepareCodeBlock', () => {
  it('returns plain code unchanged when no meta and no commands', () => {
    const result = prepareCodeBlock('const x = 1\nconst y = 2', '')
    expect(result.processedCode).toBe('const x = 1\nconst y = 2')
    expect(result.commandDoms).toEqual([])
    expect(result.title).toBeUndefined()
    expect(result.containLineNumbers).toBe(false)
    expect(result.noErrors).toBe(false)
  })

  it('extracts title from meta', () => {
    const result = prepareCodeBlock('code', 'title="config.ts"')
    expect(result.title).toBe('config.ts')
  })

  it('detects line numbers flag', () => {
    const result = prepareCodeBlock('code', 'ln')
    expect(result.containLineNumbers).toBe(true)
  })

  it('handles title + ln together', () => {
    const result = prepareCodeBlock('code', 'title="app.ts" ln')
    expect(result.title).toBe('app.ts')
    expect(result.containLineNumbers).toBe(true)
  })

  it('strips commands from code and collects overlay doms', () => {
    const code = 'const a = 1 // [svp! hl]\nconst b = 2'
    const result = prepareCodeBlock(code)
    expect(result.processedCode).toBe('const a = 1 \nconst b = 2')
    expect(result.commandDoms.length).toBeGreaterThan(0)
    expect(result.commandDoms[0]).toContain('svp-code-block--hl')
  })

  it('handles @noErrors first line', () => {
    const code = '// @noErrors\nconst x: string = 1'
    const result = prepareCodeBlock(code)
    expect(result.noErrors).toBe(true)
    expect(result.processedCode).toBe('// @noErrors\nconst x: string = 1')
  })

  it('tracks original line count for line numbers', () => {
    const result = prepareCodeBlock('a\nb\nc')
    expect(result.lines).toEqual(['a', 'b', 'c'])
  })
})

describe('wrapCodeBlock', () => {
  const mockShikiHtml = '<pre class="shiki"><code><span>code</span></code></pre>'

  it('wraps with standard structure', () => {
    const prepared = prepareCodeBlock('code', '')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).toContain('svp-code-block-wrapper')
    expect(html).toContain('svp-code-block--lang')
    expect(html).toContain('>ts<')
    expect(html).toContain(mockShikiHtml)
  })

  it('includes title when present', () => {
    const prepared = prepareCodeBlock('code', 'title="app.ts"')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).toContain('svp-code-block--title')
    expect(html).toContain('app.ts')
  })

  it('excludes title when not present', () => {
    const prepared = prepareCodeBlock('code', '')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).not.toContain('svp-code-block--title')
  })

  it('adds line numbers class and elements when ln', () => {
    const prepared = prepareCodeBlock('a\nb\nc', 'ln')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).toContain('svp-code-block--with-line-numbers')
    expect(html).toContain('svp-code-block--line-numbers')
    expect(html).toContain('>1<')
    expect(html).toContain('>2<')
    expect(html).toContain('>3<')
  })

  it('includes command overlay doms', () => {
    const prepared = prepareCodeBlock('const x = 1 // [svp! hl]', '')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).toContain('svp-code-block--hl')
  })

  it('includes copy button HTML when provided', () => {
    const prepared = prepareCodeBlock('code', '')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared, {
      copyButtonHtml: '<button class="my-copy">Copy</button>',
    })
    expect(html).toContain('<button class="my-copy">Copy</button>')
  })

  it('omits copy button when not provided', () => {
    const prepared = prepareCodeBlock('code', '')
    const html = wrapCodeBlock(mockShikiHtml, 'ts', prepared)
    expect(html).not.toContain('my-copy')
  })

  it('escapes curly braces when escapeForSvelte is true', () => {
    const shikiWithBraces = '<pre class="shiki"><code>const x = { a: 1 }</code></pre>'
    const prepared = prepareCodeBlock('const x = { a: 1 }', '')
    const html = wrapCodeBlock(shikiWithBraces, 'ts', prepared, {
      escapeForSvelte: true,
    })
    expect(html).toContain('&#123;')
    expect(html).toContain('&#125;')
    expect(html).not.toContain('{ a')
  })

  it('does NOT escape curly braces by default', () => {
    const shikiWithBraces = '<pre class="shiki"><code>const x = { a: 1 }</code></pre>'
    const prepared = prepareCodeBlock('const x = { a: 1 }', '')
    const html = wrapCodeBlock(shikiWithBraces, 'ts', prepared)
    expect(html).toContain('{ a: 1 }')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/vite && npx vitest run __tests__/code-block.test.ts`
Expected: FAIL — module `../src/highlight/code-block` not found

- [ ] **Step 3: Write the code-block module**

```typescript
// packages/vite/src/highlight/code-block.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/vite && npx vitest run __tests__/code-block.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vite/src/highlight/code-block.ts packages/vite/__tests__/code-block.test.ts
git commit -m "feat(vite): add shared code-block prepare/wrap utilities"
```

---

### Task 3: Create index + configure exports

**Files:**
- Create: `packages/vite/src/highlight/index.ts`
- Modify: `packages/vite/package.json` (add `./highlight` export)
- Modify: `packages/vite/build.config.ts` (add entry)

- [ ] **Step 1: Create the index barrel file**

```typescript
// packages/vite/src/highlight/index.ts
export { COMMAND_CHEAT_LIST, COMMAND_RE, processCommands } from './commands.js'
export type { PreparedCodeBlock, WrapCodeBlockOptions } from './code-block.js'
export { prepareCodeBlock, wrapCodeBlock } from './code-block.js'
```

- [ ] **Step 2: Add `./highlight` export to package.json**

In `packages/vite/package.json`, add to the `"exports"` field:

```json
"./highlight": {
  "import": "./dist/highlight/index.mjs",
  "types": "./dist/highlight/index.d.ts"
}
```

Also add `"dist/highlight"` is already covered by the `"files": ["dist"]` glob so no change needed there.

- [ ] **Step 3: Add entry to build.config.ts**

```typescript
// packages/vite/build.config.ts
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/highlight/index',
  ],
  rollup: {
    resolve: {},
    inlineDependencies: true,
  },
  failOnWarn: false,
})
```

- [ ] **Step 4: Verify build works**

Run: `cd packages/vite && pnpm build`
Expected: Build succeeds, `dist/highlight/index.mjs` and `dist/highlight/index.d.ts` are generated

- [ ] **Step 5: Commit**

```bash
git add packages/vite/src/highlight/index.ts packages/vite/package.json packages/vite/build.config.ts
git commit -m "feat(vite): export shared highlight utilities via @sveltepress/vite/highlight"
```

---

## Phase 2: Refactor `@sveltepress/theme-default`

### Task 4: Refactor theme-default highlighter to use shared code

**Files:**
- Modify: `packages/theme-default/src/markdown/highlighter.ts`
- Delete: `packages/theme-default/src/markdown/commands.ts`
- Delete: `packages/theme-default/__tests__/code-command.test.ts`

- [ ] **Step 1: Update highlighter.ts imports and logic**

In `packages/theme-default/src/markdown/highlighter.ts`:

Replace the import:
```typescript
import { processCommands } from './commands.js'
```
With:
```typescript
import { prepareCodeBlock, wrapCodeBlock } from '@sveltepress/vite/highlight'
```

Then replace the `highlighter` function body (lines 50-95) with:

```typescript
const highlighter: Highlighter = async (code, lang, meta) => {
  const cacheKey = JSON.stringify({ code, lang, meta })
  let cached
  if (env.NODE_ENV === 'development') {
    cached = cache.get(cacheKey)
    if (cached)
      return cached
  }

  const prepared = prepareCodeBlock(code, meta)

  cached = wrapCodeBlock(
    await _highlighter(prepared.processedCode, lang, meta),
    lang,
    prepared,
    {
      copyButtonHtml: `<!-- svelte-ignore a11y_no_noninteractive_tabindex -->\n    <CopyCode />`,
    },
  )

  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, cached)
  return cached
}
```

**Important:** Do NOT pass `escapeForSvelte: true` here. The `_highlighter` already escapes `{`/`}` in Shiki's output before returning, which is correct because the wrapper HTML contains `<CopyCode />` (a Svelte component that must NOT be escaped). Keep `_highlighter` completely unchanged — its `{`/`}` escaping and twoslash snippet replacements stay as-is.

- [ ] **Step 2: Delete old commands.ts**

```bash
rm packages/theme-default/src/markdown/commands.ts
rm packages/theme-default/__tests__/code-command.test.ts
```

- [ ] **Step 3: Run theme-default tests to verify no regressions**

Run: `cd packages/theme-default && npx vitest run`
Expected: All existing tests PASS. The `code-command.test.ts` is deleted, and the remaining tests (line-highlight, twoslash, etc.) should still pass.

- [ ] **Step 4: Commit**

```bash
git add packages/theme-default/src/markdown/highlighter.ts
git add -u packages/theme-default/src/markdown/commands.ts packages/theme-default/__tests__/code-command.test.ts
git commit -m "refactor(theme-default): use shared highlight utilities from @sveltepress/vite"
```

---

## Phase 3: Blog Theme Highlighting

### Task 5: Update blog theme types and config

**Files:**
- Modify: `packages/theme-blog/src/types.ts`
- Modify: `packages/theme-blog/src/vite-plugin.ts`

- [ ] **Step 1: Add twoslash option to HighlighterOptions**

In `packages/theme-blog/src/types.ts`, update the `HighlighterOptions` interface:

```typescript
export interface HighlighterOptions {
  /** Shiki dark theme name. Default: `'night-owl'` */
  themeDark?: string
  /** Shiki light theme name. Default: `'vitesse-light'` */
  themeLight?: string
  /** Extra languages to load (merged with defaults). */
  languages?: string[]
  /** Enable Twoslash TypeScript hover info. Uses plain HTML renderer (works in {@html}). Default: false */
  twoslash?: boolean
}
```

- [ ] **Step 2: Update vite-plugin.ts to pass config**

No change needed — `vite-plugin.ts` already calls `initHighlighter(options.highlighter)` which passes through the full `HighlighterOptions`. The `twoslash` field will be consumed in the enhanced `highlighter.ts` (Task 6).

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/types.ts
git commit -m "feat(theme-blog): add twoslash option to highlighter config"
```

---

### Task 6: Enhance blog theme highlighter

**Files:**
- Modify: `packages/theme-blog/src/highlighter.ts`
- Modify: `packages/theme-blog/package.json`

- [ ] **Step 1: Add dependencies**

In `packages/theme-blog/package.json`, add to `"dependencies"`:

```json
"lru-cache": "catalog:",
"@shikijs/twoslash": "catalog:"
```

Run: `pnpm install`

- [ ] **Step 2: Rewrite highlighter.ts**

```typescript
// packages/theme-blog/src/highlighter.ts
import type { HighlighterOptions } from './types.js'
import type { BundledLanguage, BundledTheme, CodeToHastOptions, HighlighterGeneric } from 'shiki'
import { env } from 'node:process'
import { LRUCache } from 'lru-cache'
import { createHighlighter } from 'shiki'

const DEFAULT_LANGUAGES: BundledLanguage[] = [
  'svelte', 'sh', 'bash', 'js', 'javascript',
  'ts', 'typescript', 'html', 'css', 'scss',
  'json', 'md', 'yaml', 'jsx', 'tsx',
]

const cache = new LRUCache<string, string>({ max: 200 })

let instance: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null
let darkTheme: BundledTheme = 'night-owl'
let lightTheme: BundledTheme = 'vitesse-light'

/**
 * Initialise the Shiki highlighter singleton.
 * Called in the Vite plugin's `buildStart` hook.
 */
export async function initHighlighter(config: HighlighterOptions = {}): Promise<void> {
  darkTheme = (config.themeDark ?? 'night-owl') as BundledTheme
  lightTheme = (config.themeLight ?? 'vitesse-light') as BundledTheme

  const extra = (config.languages ?? []) as BundledLanguage[]
  const langs = [...new Set([...DEFAULT_LANGUAGES, ...extra])]

  const themes: BundledTheme[] = [darkTheme, lightTheme]

  instance = await createHighlighter({ langs, themes })

  if (config.twoslash) {
    const { createTransformerFactory } = await import('@shikijs/twoslash')
    const { rendererRich } = await import('@shikijs/twoslash')
    twoslashTransformer = createTransformerFactory({})({
      langs: ['ts', 'tsx'],
      renderer: rendererRich(),
    })
  }
}

let twoslashTransformer: any = null

/**
 * Highlight code with Shiki. Returns an HTML string with dual-theme inline styles.
 * Uses LRU cache in development mode.
 */
export function highlight(code: string, lang?: string): string {
  const cacheKey = `${lang}:${code}`
  if (env.NODE_ENV === 'development') {
    const cached = cache.get(cacheKey)
    if (cached)
      return cached
  }

  if (!instance)
    throw new Error('[theme-blog] Shiki highlighter not initialised — call initHighlighter() first')

  const language = (lang || 'text') as BundledLanguage
  const loadedLangs = instance.getLoadedLanguages()
  const resolvedLang = loadedLangs.includes(language) ? language : 'text'

  const options: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang: resolvedLang,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
    transformers: twoslashTransformer ? [twoslashTransformer] : [],
  }

  const result = instance.codeToHtml(code, options)

  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, result)

  return result
}
```

Note: The existing `highlighter.ts` defined `HighlighterConfig` locally. The rewrite above imports `HighlighterOptions` from `types.ts` instead (they have the same shape, plus the new `twoslash` field).

- [ ] **Step 3: Commit**

```bash
git add packages/theme-blog/src/highlighter.ts packages/theme-blog/package.json
git commit -m "feat(theme-blog): enhance highlighter with LRU cache and twoslash support"
```

---

### Task 7: Create remark-code-blocks plugin with tests

**Files:**
- Create: `packages/theme-blog/src/remark-code-blocks.ts`
- Test: `packages/theme-blog/__tests__/remark-code-blocks.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// packages/theme-blog/__tests__/remark-code-blocks.test.ts
import { beforeAll, describe, expect, it } from 'vitest'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { initHighlighter } from '../src/highlighter.js'
import { remarkCodeBlocks } from '../src/remark-code-blocks.js'

beforeAll(async () => {
  await initHighlighter()
})

function process(md: string): Promise<string> {
  return unified()
    .use(remarkParse)
    .use(remarkCodeBlocks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then(vfile => String(vfile))
}

describe('remarkCodeBlocks', () => {
  it('highlights a basic code block', async () => {
    const md = '```ts\nconst x = 1\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block-wrapper')
    expect(html).toContain('svp-code-block--lang')
    expect(html).toContain('>ts<')
    expect(html).toContain('class="shiki')
  })

  it('adds title when meta contains title=', async () => {
    const md = '```ts title="config.ts"\nconst x = 1\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--title')
    expect(html).toContain('config.ts')
  })

  it('adds line numbers when meta contains ln', async () => {
    const md = '```ts ln\nconst a = 1\nconst b = 2\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--with-line-numbers')
    expect(html).toContain('svp-code-block--line-numbers')
    expect(html).toContain('>1<')
    expect(html).toContain('>2<')
  })

  it('processes highlight commands', async () => {
    const md = '```ts\nconst x = 1 // [svp! hl]\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--hl')
    // Command should be stripped from rendered code
    expect(html).not.toContain('[svp! hl]')
  })

  it('processes diff commands', async () => {
    const md = '```ts\nconst added = 1 // [svp! ++]\nconst removed = 2 // [svp! --]\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--diff-bg-add')
    expect(html).toContain('svp-code-block--diff-bg-sub')
  })

  it('includes copy button', async () => {
    const md = '```ts\ncode\n```'
    const html = await process(md)
    expect(html).toContain('svp-code-block--copy-btn')
  })

  it('does not escape curly braces (blog uses {@html})', async () => {
    const md = '```ts\nconst x = { a: 1 }\n```'
    const html = await process(md)
    // The Shiki output may contain { } in syntax tokens — they should NOT be escaped
    expect(html).not.toContain('&#123;')
  })

  it('leaves non-code content untouched', async () => {
    const md = '# Hello\n\nSome text.\n\n```ts\ncode\n```\n\nMore text.'
    const html = await process(md)
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<p>Some text.</p>')
    expect(html).toContain('svp-code-block-wrapper')
    expect(html).toContain('<p>More text.</p>')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/theme-blog && npx vitest run __tests__/remark-code-blocks.test.ts`
Expected: FAIL — module `../src/remark-code-blocks.js` not found

- [ ] **Step 3: Write the remark plugin**

```typescript
// packages/theme-blog/src/remark-code-blocks.ts
import type { Code, Root } from 'mdast'
import { prepareCodeBlock, wrapCodeBlock } from '@sveltepress/vite/highlight'
import { visit } from 'unist-util-visit'
import { highlight } from './highlighter.js'

const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`

const COPY_BUTTON_HTML = `<button class="svp-code-block--copy-btn" aria-label="Copy code"><span class="svp-code-block--copy-icon">${COPY_ICON_SVG}</span><span class="svp-code-block--check-icon">${CHECK_ICON_SVG}</span></button>`

/**
 * Remark plugin that replaces fenced code blocks with Shiki-highlighted,
 * fully-wrapped code block HTML using shared utilities from @sveltepress/vite.
 */
export function remarkCodeBlocks() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (index === undefined || !parent)
        return

      const lang = node.lang || 'text'
      const meta = node.meta || ''

      const prepared = prepareCodeBlock(node.value, meta)
      const highlightedHtml = highlight(prepared.processedCode, lang)

      const fullHtml = wrapCodeBlock(highlightedHtml, lang, prepared, {
        copyButtonHtml: COPY_BUTTON_HTML,
      })

      ;(parent.children[index] as any) = { type: 'html', value: fullHtml }
    })
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/theme-blog && npx vitest run __tests__/remark-code-blocks.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/remark-code-blocks.ts packages/theme-blog/__tests__/remark-code-blocks.test.ts
git commit -m "feat(theme-blog): add remark-code-blocks plugin using shared highlight utilities"
```

---

### Task 8: Update pipeline and clean up

**Files:**
- Modify: `packages/theme-blog/src/parse-post.ts`
- Delete: `packages/theme-blog/src/rehype-shiki.ts`

- [ ] **Step 1: Update parse-post.ts pipeline**

Replace the full file content of `packages/theme-blog/src/parse-post.ts`:

```typescript
import type { BlogPost } from './types.js'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import { readingTime } from './reading-time.js'
import { remarkCodeBlocks } from './remark-code-blocks.js'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCodeBlocks)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

/** Split raw markdown into frontmatter YAML block and body text. */
function splitFrontmatter(raw: string): { yaml: string, body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match)
    return { yaml: '', body: raw }
  return { yaml: match[1], body: match[2] }
}

/** Strip HTML tags to get plain text for excerpt generation. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export interface ParsedPost extends BlogPost {
  draft: boolean
}

export async function parsePost(slug: string, raw: string): Promise<ParsedPost> {
  const { yaml, body } = splitFrontmatter(raw)
  const fm = yaml ? (parseYaml(yaml) as Record<string, unknown>) : {}

  const contentHtml = String(await processor.process(body))

  const plainBody = stripHtml(contentHtml)
  const excerpt = typeof fm.excerpt === 'string'
    ? fm.excerpt
    : plainBody.slice(0, 120).trimEnd()

  return {
    slug,
    title: String(fm.title ?? ''),
    date: fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? ''),
    cover: typeof fm.cover === 'string' ? fm.cover : undefined,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    category: typeof fm.category === 'string' ? fm.category : undefined,
    excerpt,
    author: typeof fm.author === 'string' ? fm.author : undefined,
    readingTime: readingTime(body),
    contentHtml,
    draft: fm.draft === true,
  }
}
```

- [ ] **Step 2: Delete rehype-shiki.ts**

```bash
rm packages/theme-blog/src/rehype-shiki.ts
```

- [ ] **Step 3: Remove `hast-util-to-string` from dependencies**

In `packages/theme-blog/package.json`, remove `"hast-util-to-string": "^3.0.1"` from `"dependencies"` (only used by the deleted `rehype-shiki.ts`).

Run: `pnpm install`

- [ ] **Step 4: Run existing parse-post tests**

Run: `cd packages/theme-blog && npx vitest run __tests__/parse-post.test.ts`
Expected: All tests PASS (the `contentHtml` assertion still matches since the content now includes richer HTML wrapping, but `<strong>body</strong>` is still present in a `<p>` tag)

Note: If the `renders contentHtml` test fails because the HTML structure changed (code blocks in the test input), review the test fixtures — the test only checks for `<strong>body</strong>` in the MINIMAL fixture which has no code blocks, so it should pass.

- [ ] **Step 5: Commit**

```bash
git add packages/theme-blog/src/parse-post.ts packages/theme-blog/package.json
git add -u packages/theme-blog/src/rehype-shiki.ts
git commit -m "feat(theme-blog): switch pipeline to remark-code-blocks, remove rehype-shiki"
```

---

### Task 9: Add copy button event delegation to PostLayout

**Files:**
- Modify: `packages/theme-blog/src/components/PostLayout.svelte`

- [ ] **Step 1: Add onMount import and copy button handler**

At the top of `PostLayout.svelte`, add `onMount` import and the event delegation logic:

```svelte
<!-- src/components/PostLayout.svelte -->
<script lang="ts">
  import type { BlogPost } from '../types.js'
  import { onMount } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import PostHero from './PostHero.svelte'
  import PostMeta from './PostMeta.svelte'
  import PostNav from './PostNav.svelte'
  import TableOfContents from './TableOfContents.svelte'

  interface Props {
    post: BlogPost
    prev?: BlogPost
    next?: BlogPost
  }

  const { post, prev, next }: Props = $props()
  const siteTitle = blogConfig.title ?? 'Blog'

  onMount(() => {
    const container = document.querySelector('.sp-post-content')
    if (!container) return

    const handler = (e: Event) => {
      const btn = (e.target as Element).closest('.svp-code-block--copy-btn')
      if (!btn) return
      const code = btn.closest('.svp-code-block')?.querySelector('.shiki')?.textContent || ''
      navigator.clipboard.writeText(code)
      btn.classList.add('copied')
      setTimeout(() => btn.classList.remove('copied'), 2000)
    }

    container.addEventListener('click', handler)
    return () => container.removeEventListener('click', handler)
  })
</script>
```

The rest of the template and styles remain unchanged.

- [ ] **Step 2: Commit**

```bash
git add packages/theme-blog/src/components/PostLayout.svelte
git commit -m "feat(theme-blog): add copy button event delegation in PostLayout"
```

---

### Task 10: Add code block CSS to GlobalLayout

**Files:**
- Modify: `packages/theme-blog/src/components/GlobalLayout.svelte`

- [ ] **Step 1: Replace existing Shiki styles with full code block styles**

In `GlobalLayout.svelte`, replace the existing code block CSS section (the `/* Shiki dual-theme switching */` and `/* Code block styling */` blocks, approximately lines 139-168) with the comprehensive styles below:

```css
  /* ── Shiki dual-theme switching ─────────────────────────── */
  :global([data-theme='dark']) .sp-blog-root :global(.shiki),
  :global([data-theme='dark']) .sp-blog-root :global(.shiki span) {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }

  /* ── Code block wrapper ─────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block-wrapper) {
    position: relative;
    margin-bottom: 1.25rem;
  }

  .sp-blog-root :global(.svp-code-block) {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
  }

  .sp-blog-root :global(.svp-code-block pre.shiki) {
    margin: 0;
    padding: 12px 16px;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .sp-blog-root :global(.svp-code-block pre.shiki code) {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
    border-radius: 0;
  }

  /* ── Title bar ──────────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--title) {
    padding: 8px 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sp-blog-muted);
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
  }

  .sp-blog-root :global(.svp-code-block--title + .svp-code-block) {
    border-radius: 0 0 8px 8px;
  }

  /* ── Language label ─────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--lang) {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 0.75rem;
    color: var(--sp-blog-muted);
    opacity: 0.6;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.2s;
  }

  .sp-blog-root :global(.svp-code-block:hover .svp-code-block--lang) {
    opacity: 0;
  }

  /* ── Copy button ────────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--copy-btn) {
    position: absolute;
    top: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--sp-blog-border);
    border-radius: 6px;
    background: var(--sp-blog-surface);
    color: var(--sp-blog-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, border-color 0.2s, color 0.2s;
    z-index: 10;
  }

  .sp-blog-root :global(.svp-code-block:hover .svp-code-block--copy-btn) {
    opacity: 1;
  }

  .sp-blog-root :global(.svp-code-block--copy-btn:hover) {
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-primary);
  }

  .sp-blog-root :global(.svp-code-block--copy-btn .svp-code-block--check-icon) {
    display: none;
  }

  .sp-blog-root :global(.svp-code-block--copy-btn.copied .svp-code-block--copy-icon) {
    display: none;
  }

  .sp-blog-root :global(.svp-code-block--copy-btn.copied .svp-code-block--check-icon) {
    display: flex;
    color: #22c55e;
  }

  /* ── Command overlays ───────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--command-line) {
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5em;
    pointer-events: none;
  }

  /* Highlight */
  .sp-blog-root :global(.svp-code-block--hl) {
    background: rgba(251, 146, 60, 0.15);
    border-left: 3px solid var(--sp-blog-primary);
  }

  /* Diff add */
  .sp-blog-root :global(.svp-code-block--diff-bg-add) {
    background: rgba(34, 197, 94, 0.15);
    border-left: 3px solid #22c55e;
  }

  .sp-blog-root :global(.svp-code-block--diff-add) {
    position: absolute;
    left: 6px;
    color: #22c55e;
    font-size: 0.75rem;
    font-weight: 700;
    user-select: none;
  }

  /* Diff remove */
  .sp-blog-root :global(.svp-code-block--diff-bg-sub) {
    background: rgba(239, 68, 68, 0.15);
    border-left: 3px solid #ef4444;
  }

  .sp-blog-root :global(.svp-code-block--diff-sub) {
    position: absolute;
    left: 6px;
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 700;
    user-select: none;
  }

  /* Focus */
  .sp-blog-root :global(.svp-code-block--focus) {
    position: absolute;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: none;
  }

  /* ── Line numbers ───────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--with-line-numbers pre.shiki) {
    padding-left: 3.5rem;
  }

  .sp-blog-root :global(.svp-code-block--line-numbers) {
    position: absolute;
    top: 12px;
    left: 0;
    width: 3rem;
    text-align: right;
    padding-right: 12px;
    user-select: none;
    pointer-events: none;
  }

  .sp-blog-root :global(.svp-code-block--line-number-item) {
    height: 1.5em;
    line-height: 1.5;
    font-size: 0.875rem;
    color: var(--sp-blog-muted);
    opacity: 0.5;
  }
```

- [ ] **Step 2: Commit**

```bash
git add packages/theme-blog/src/components/GlobalLayout.svelte
git commit -m "feat(theme-blog): add comprehensive code block CSS styles"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run all blog theme tests**

Run: `cd packages/theme-blog && npx vitest run`
Expected: All tests PASS (parse-post, build-index, reading-time, rss, remark-code-blocks)

- [ ] **Step 2: Run vite package tests**

Run: `cd packages/vite && npx vitest run`
Expected: All tests PASS (including new commands and code-block tests)

- [ ] **Step 3: Run theme-default tests (regression check)**

Run: `cd packages/theme-default && npx vitest run`
Expected: All tests PASS (highlighter refactor is backward-compatible)

- [ ] **Step 4: Build all affected packages**

Run: `pnpm --filter @sveltepress/vite build && pnpm --filter @sveltepress/theme-blog build`
Expected: Both builds succeed without errors

- [ ] **Step 5: Commit any remaining changes**

If linting or formatting created additional changes:

```bash
git add -A
git commit -m "chore: lint and format after blog theme code highlighting"
```
