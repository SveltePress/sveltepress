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
