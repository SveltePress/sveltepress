import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'

/** Distinct token colours in the output. Plain text has none: its tokens carry no style. */
function colours(html: string) {
  return new Set([...html.matchAll(/<span style="color:(#[0-9a-f]+)/gi)].map(match => match[1]))
}

describe('code block languages', () => {
  beforeAll(async () => {
    // No `highlighter.languages`: only the default list is preloaded.
    await initHighlighter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['python', 'def greet(name):\n    return f"hi {name}"'],
    ['json', '{ "name": "sveltepress", "private": true }'],
    ['yaml', 'name: sveltepress\nprivate: true'],
    ['rust', 'fn main() { println!("hi"); }'],
    ['diff', '- before\n+ after'],
    ['tsx', 'const view = <button disabled>hi</button>'],
  ])('highlights %s without it being listed in highlighter.languages', async (lang, code) => {
    const html = await highlighter(code, lang)

    expect(colours(html).size).toBeGreaterThan(1)
  })

  it('accepts shiki aliases and any casing', async () => {
    expect(colours(await highlighter('name = "sveltepress"', 'py')).size).toBeGreaterThan(1)
    const titleCase = await highlighter('name = "sveltepress"', 'Python')
    expect(colours(titleCase).size).toBeGreaterThan(1)
    // The label keeps what the author wrote.
    expect(titleCase).toContain('svp-code-block--lang">Python<')
    expect(colours(await highlighter('name: sveltepress', 'YML')).size).toBeGreaterThan(1)
  })

  it('serves several pages that need the same unloaded language at the same time', async () => {
    const blocks = await Promise.all(
      ['a = 1', 'b = 2', 'c = 3'].map(code => highlighter(`${code} # comment`, 'ruby')),
    )

    for (const html of blocks)
      expect(colours(html).size).toBeGreaterThan(1)
  })

  it('renders a language shiki does not know as plain text, and says so once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const first = await highlighter('anything at all', 'not-a-language')
    await highlighter('something else', 'not-a-language')

    expect(first).toContain('anything at all')
    expect(colours(first).size).toBe(0)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('not-a-language')
  })

  it.each(['text', 'txt', 'plaintext', 'TEXT', undefined])('treats %s as plain text without a warning', async (lang) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const html = await highlighter('just some words', lang)

    expect(html).toContain('just some words')
    expect(warn).not.toHaveBeenCalled()
  })
})
