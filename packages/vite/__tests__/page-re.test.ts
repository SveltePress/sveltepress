import { describe, expect, it } from 'vitest'
import { PAGE_OR_LAYOUT_RE } from '../src/plugin'

describe('page re', () => {
  it('normal', () => {
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/+page.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/+page.svelte')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/foo/+page.svelte')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/foo/+page.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/+page.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/bar/+page.md')).toBe(true)

    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/foo/+page@bar.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/bar/+page@abc.md')).toBe(true)

    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo-bar)/bar/+page@abc.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo_bar)/bar/+page@abc.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo bar)/bar/+page@abc.md')).toBe(true)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo bar)/bar/+page@abc.md')).toBe(true)

    // don't match server files
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/+page.ts')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/+page.server.js')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/foo/+page@abc.server.ts')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/foo/+page.js')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/+page.ts')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/bar/+page@cba.server.js')).toBe(false)
    expect(PAGE_OR_LAYOUT_RE.test('/src/routes/(foo)/bar/+page.ts')).toBe(false)
  })
})
