import { expect, it } from 'vitest'

import { getChangesetFilename } from './check-utils.mjs'

it('formats dependency update changeset filename with the local date prefix', () => {
  const filename = getChangesetFilename(new Date(2026, 4, 5))

  expect(filename).toBe('2026-05-05-update-deps.md')
})
