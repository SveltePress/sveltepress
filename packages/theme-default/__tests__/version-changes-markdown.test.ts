import type { VersionManifest } from '@sveltepress/vite/versioning'
import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import versionChanges from '../src/markdown/version-changes'

const manifest: VersionManifest = {
  basePath: '/v',
  current: { id: '2026-08-28', label: 'Current' },
  versions: [{ id: '2026-08-27', label: 'Previous' }],
  content: { include: ['**'], exclude: [], shared: [] },
}

const source = `
:::since[Hot reload]{version="2026-08-28" id="hot-reload" summary="Faster feedback"}
No restart needed.
:::
`

describe('version change markdown', () => {
  it('renders a stable anchor and version marker without baking the active version label', async () => {
    const { code } = await mdToSvelte({
      filename: '/site/src/routes/guide/+page.md',
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest, newLabel: '新增于 {version}' })],
    })
    expect(code).toContain('id="hot-reload"')
    expect(code).toContain('tabindex="-1"')
    expect(code).toContain('data-sveltepress-introduced-in="2026-08-28"')
    expect(code).toContain('data-sveltepress-version-label-template="新增于 __SVELTEPRESS_VERSION__"')
    expect(code).not.toContain('新增于 Current')
    expect(code).toContain('Hot reload')
    expect(code).toContain('No restart needed.')
  })

  it('emits identical content for a newer manifest and a historical route', async () => {
    const newer = { ...manifest, current: { id: '2026-08-29', label: 'Next' }, versions: [manifest.current, ...manifest.versions] }
    const render = (filename: string, selectedManifest: VersionManifest) => mdToSvelte({
      filename,
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest: selectedManifest })],
    })
    const current = await render('/site/src/routes/guide/+page.md', manifest)
    const advanced = await render('/site/src/routes/guide/+page.md', newer)
    const historical = await render('/site/src/routes/v/2026-08-28/guide/+page.md', newer)

    expect(advanced.code).toBe(current.code)
    expect(historical.code).toBe(current.code)
    expect(current.code).toContain('data-sveltepress-introduced-in="2026-08-28"')
  })

  it('leaves manifestless markdown byte-for-byte untouched', async () => {
    const withoutPlugin = await mdToSvelte({
      filename: '/site/src/routes/guide/+page.md',
      mdContent: source,
    })
    const withPlugin = await mdToSvelte({
      filename: '/site/src/routes/v/2026-08-28/guide/+page.md',
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest: null })],
    })
    expect(withPlugin.code).toBe(withoutPlugin.code)
  })
})
