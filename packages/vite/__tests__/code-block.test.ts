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
