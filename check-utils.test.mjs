import { expect, it } from 'vitest'

import { getChangesetFilename, isHistoricalVersionRoute } from './check-utils.mjs'

it('formats dependency update changeset filename with the local date prefix', () => {
  const filename = getChangesetFilename(new Date(2026, 4, 5))

  expect(filename).toBe('2026-05-05-update-deps.md')
})

it('recognizes only manifest-declared historical route trees', () => {
  expect(isHistoricalVersionRoute('v/8.1/guide/+page.md', '/v', ['8.1'])).toBe(true)
  expect(isHistoricalVersionRoute('v/8.10/guide/+page.md', '/v', ['8.1'])).toBe(false)
  expect(isHistoricalVersionRoute('guide/+page.md', '/v', ['8.1'])).toBe(false)
})
