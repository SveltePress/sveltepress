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
  it('renders a stable anchor and a localized badge in the introduced version', async () => {
    const { code } = await mdToSvelte({
      filename: '/site/src/routes/guide/+page.md',
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest, newLabel: '新增于 {version}' })],
    })
    expect(code).toContain('id="hot-reload"')
    expect(code).toContain('新增于 Current')
    expect(code).toContain('Hot reload')
    expect(code).toContain('No restart needed.')
  })

  it('keeps the anchored content but hides an old badge in a newer version', async () => {
    const newer = { ...manifest, current: { id: '2026-08-29', label: 'Next' }, versions: [manifest.current, ...manifest.versions] }
    const { code } = await mdToSvelte({
      filename: '/site/src/routes/guide/+page.md',
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest: newer })],
    })
    expect(code).toContain('id="hot-reload"')
    expect(code).toContain('Hot reload')
    expect(code).not.toContain('New in')
  })

  it('shows the badge from a frozen historical route', async () => {
    const newer = { ...manifest, current: { id: '2026-08-29', label: 'Next' }, versions: [manifest.current, ...manifest.versions] }
    const { code } = await mdToSvelte({
      filename: '/site/src/routes/v/2026-08-28/guide/+page.md',
      mdContent: source,
      remarkPlugins: [versionChanges({ manifest: newer })],
    })
    expect(code).toContain('New in Current')
  })
})
