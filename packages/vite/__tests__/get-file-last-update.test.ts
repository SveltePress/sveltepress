import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { getFileLastUpdateTime } from '../src/utils/get-file-last-update'

it('omits the last-update value for a file without Git history', async () => {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-last-update-'))
  const file = join(root, '+page.md')
  writeFileSync(file, '# New page')

  await expect(getFileLastUpdateTime(file)).resolves.toBe('')
})
