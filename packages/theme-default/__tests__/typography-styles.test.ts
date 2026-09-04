import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('default theme typography styling', () => {
  const cssPath = resolve(import.meta.dirname, '../src/style.css')
  const css = readFileSync(cssPath, 'utf8')

  it('defines inline code styles with padding, border-radius and color', () => {
    expect(css).toMatch(/:not\(pre\)\s*>\s*code\s*\{/)
    expect(css).toContain('font-family: var(--svp-code-font);')
    expect(css).toContain('padding: 0.2em 0.4em;')
    expect(css).toContain('border-radius: 6px;')
    expect(css).toContain('html.dark :not(pre) > code')
  })

  it('defines editorial blockquote styles with left border accent and italic styling', () => {
    expect(css).toContain('.theme-default--page-layout .content blockquote')
    expect(css).toContain('border-left: 4px solid var(--docsearch-primary-color, #fb7185);')
    expect(css).toContain('font-style: italic;')
  })

  it('defines keyboard kbd keycap styles with 3D border-bottom and shadow', () => {
    expect(css).toMatch(/kbd\s*\{/)
    expect(css).toContain('border-bottom: 2px solid rgba(0, 0, 0, 0.3);')
    expect(css).toContain('html.dark kbd')
    expect(css).toContain('border-bottom: 2px solid rgba(255, 255, 255, 0.25);')
  })

  it('defines responsive table styles with overflow-x scrolling and zebra striping', () => {
    expect(css).toContain('.theme-default--page-layout .content table')
    expect(css).toContain('overflow-x: auto;')
    expect(css).toContain('border-collapse: collapse;')
    expect(css).toContain('.theme-default--page-layout .content th')
    expect(css).toContain('.theme-default--page-layout .content tr:nth-child(even)')
    expect(css).toContain('.theme-default--page-layout .content tr:hover')
  })
})
