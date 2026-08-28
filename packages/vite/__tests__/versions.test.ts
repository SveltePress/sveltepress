import type { VersionManifest } from '../src/versioning'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  loadVersionManifest,
  resolveVersionContext,
  resolveVersionedPath,
  resolveVersionSwitch,
  validateVersionId,
  validateVersionManifest,
} from '../src/versioning'

function manifest(): VersionManifest {
  return {
    basePath: '/v',
    current: { id: 'v9', label: '9.x' },
    versions: [
      { id: '8.1.0', label: '8.1', status: 'stable', routes: ['/', '/guide/', '/guide/install/'] },
      { id: 'v7', label: '7.x', status: 'eol', routes: ['/', '/guide/'] },
    ],
    content: { include: ['**'], exclude: [], shared: [] },
  }
}

describe('version manifest', () => {
  it('accepts safe stable ids and rejects ambiguous segments', () => {
    expect(validateVersionId('v8')).toBe(true)
    expect(validateVersionId('8.1.0')).toBe(true)
    expect(validateVersionId('next-2026')).toBe(true)
    expect(validateVersionId('V8')).toBe(false)
    expect(validateVersionId('..')).toBe(false)
    expect(validateVersionId('v8/beta')).toBe(false)
    expect(validateVersionId('v8 beta')).toBe(false)
  })

  it('returns null when the default manifest is absent', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-versions-'))
    expect(loadVersionManifest(root)).toBeNull()
  })

  it('loads and validates a project manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-versions-'))
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(manifest()))
    expect(loadVersionManifest(root)?.current.id).toBe('v9')
  })

  it('rejects duplicate ids and an invalid route base', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-versions-'))
    const invalid = manifest()
    invalid.basePath = '/v/'
    invalid.versions.push({ id: 'v7', label: 'duplicate', status: 'stable', routes: [] })
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(invalid))
    expect(() => loadVersionManifest(root)).toThrow(/basePath.*duplicate/s)
  })

  it('validates every published version field and rejects unknown fields', () => {
    const invalid = manifest() as VersionManifest & Record<string, unknown>
    invalid.versions[0] = {
      ...invalid.versions[0],
      message: 42,
      sourceRef: false,
      editLink: true,
      noIndex: 'yes',
      search: { indexName: 8, facetFilters: ['version:v8', 1] },
      sidebar: { '/guide/': [{ title: 4, to: false }] },
      unexpected: true,
    } as never
    invalid.unexpected = true
    let error = ''
    try {
      validateVersionManifest(invalid)
    }
    catch (caught) {
      error = (caught as Error).message
    }
    for (const field of ['message', 'sourceRef', 'editLink', 'noIndex', 'search', 'sidebar', 'unexpected'])
      expect(error).toContain(field)
  })

  it('discovers route inventories when they are not embedded', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-versions-'))
    const value = manifest()
    delete value.versions[0].routes
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(value))
    mkdirSync(join(root, 'src/routes/v/8.1.0/guide/install'), { recursive: true })
    writeFileSync(join(root, 'src/routes/v/8.1.0/+page.md'), '# 8.1')
    writeFileSync(join(root, 'src/routes/v/8.1.0/guide/install/+page.md'), '# Install')
    expect(loadVersionManifest(root)?.versions[0].routes).toEqual(['/', '/guide/install/'])
  })
})

describe('version route contract', () => {
  it('resolves current and historical logical paths', () => {
    expect(resolveVersionContext('/guide/install/', manifest())).toMatchObject({ versionId: 'v9', logicalPath: '/guide/install/', historical: false })
    expect(resolveVersionContext('/v/8.1.0/guide/install/', manifest())).toMatchObject({ versionId: '8.1.0', logicalPath: '/guide/install/', historical: true })
  })

  it('switches to the same page when present and the target home otherwise', () => {
    expect(resolveVersionSwitch('/guide/install/', '8.1.0', manifest())).toEqual({ href: '/v/8.1.0/guide/install/', fallback: false })
    expect(resolveVersionSwitch('/reference/new-api/', '8.1.0', manifest())).toEqual({ href: '/v/8.1.0/', fallback: true })
    expect(resolveVersionSwitch('/v/8.1.0/guide/install/', 'v9', manifest())).toEqual({ href: '/guide/install/', fallback: false })
  })

  it('keeps eligible links in the active historical version', () => {
    const context = resolveVersionContext('/v/8.1.0/guide/', manifest())
    expect(resolveVersionedPath('/guide/install/#node', context, manifest())).toBe('/v/8.1.0/guide/install/#node')
    expect(resolveVersionedPath('https://example.com', context, manifest())).toBe('https://example.com')
    expect(resolveVersionedPath('#install', context, manifest())).toBe('#install')
    expect(resolveVersionedPath('/account/', context, manifest())).toBe('/account/')
  })
})
