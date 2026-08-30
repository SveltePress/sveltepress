import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import versionChanges from '../src/markdown/version-changes'
import { createVersionManifestReader } from '../src/version-manifest'

describe('default Theme version manifest reader', () => {
  it('refreshes after the CLI advances the current version without changing page artifacts', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-theme-manifest-'))
    const path = join(root, 'sveltepress.versions.json')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Guide')
    const writeManifest = (current: string, versions: string[]) => writeFileSync(path, JSON.stringify({
      basePath: '/v',
      current: { id: current, label: current },
      versions: versions.map(id => ({ id, label: id, routes: ['/guide/'] })),
      content: { include: ['**'], exclude: [], shared: [] },
    }))
    writeManifest('v9', ['v8'])
    const read = createVersionManifestReader(root, () => ({}))
    expect(read()?.current.id).toBe('v9')
    const source = ':::since[Fast refresh]{version="v9" id="fast-refresh"}\nNew content.\n:::'
    const render = () => mdToSvelte({
      filename: join(root, 'src/routes/guide/+page.md'),
      mdContent: source,
      remarkPlugins: [versionChanges({ getManifest: read })],
    })
    const before = (await render()).code
    expect(before).toContain('data-sveltepress-introduced-in="v9"')
    expect(before).not.toContain('New in v9')

    writeManifest('v10', ['v9', 'v8'])
    expect(read()?.current.id).toBe('v10')
    expect((await render()).code).toBe(before)
  })
})
