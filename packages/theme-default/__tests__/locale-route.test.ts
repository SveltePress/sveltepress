import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resolveLogicalRoute } from '../src/components/locale'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'

describe('resolveLogicalRoute', () => {
  beforeEach(() => setLocaleFixtures(localeFixture()))
  afterEach(() => setLocaleFixtures(null))

  it('keeps the default locale route id unchanged', () => {
    expect(resolveLogicalRoute('/guide/introduction')).toBe('/guide/introduction')
    expect(resolveLogicalRoute('/')).toBe('/')
  })

  it('strips a prefixed locale route id down to the logical route', () => {
    expect(resolveLogicalRoute('/zh/guide/introduction')).toBe('/guide/introduction')
    expect(resolveLogicalRoute('/bn/guide/introduction')).toBe('/guide/introduction')
    expect(resolveLogicalRoute('/zh/')).toBe('/')
    expect(resolveLogicalRoute('/zh')).toBe('/')
    expect(resolveLogicalRoute('/bn')).toBe('/')
  })

  it('strips locale prefixes from Playground paths', () => {
    expect(resolveLogicalRoute('/playground/')).toBe('/playground/')
    expect(resolveLogicalRoute('/playground/markdown/basic-writing/')).toBe('/playground/markdown/basic-writing/')
    expect(resolveLogicalRoute('/zh/playground/')).toBe('/playground/')
    expect(resolveLogicalRoute('/zh/playground/markdown/basic-writing/')).toBe('/playground/markdown/basic-writing/')
    expect(resolveLogicalRoute('/bn/playground/')).toBe('/playground/')
    expect(resolveLogicalRoute('/bn/playground/markdown/basic-writing/')).toBe('/playground/markdown/basic-writing/')
  })

  it('strips only the longest matching locale prefix', () => {
    expect(resolveLogicalRoute('/zh/guide/default-theme/admonitions')).toBe('/guide/default-theme/admonitions')
  })

  it('leaves paths outside configured locales untouched', () => {
    expect(resolveLogicalRoute('/unrelated/route')).toBe('/unrelated/route')
  })

  it('returns the route id unchanged when no locales are configured', () => {
    setLocaleFixtures(null)
    expect(resolveLogicalRoute('/zh/guide/introduction')).toBe('/zh/guide/introduction')
  })
})
