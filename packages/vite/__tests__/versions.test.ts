import type { VersionManifest } from '../src/versioning'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  computeVersionChangeSet,
  createVersionRuntime,
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

  it('derives new pages and marked updates from the nearest historical version', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide/new'), { recursive: true })
    mkdirSync(join(root, 'src/routes/guide/existing'), { recursive: true })
    mkdirSync(join(root, 'src/routes/whats-new'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/new/+page.md'), '---\ntitle: New API\ndescription: Learn the API\n---\n# New API')
    writeFileSync(join(root, 'src/routes/guide/existing/+page.md'), [
      '---',
      'title: Existing guide',
      '---',
      ':::since[Hot reload]{version="v9" id="hot-reload" summary="No restart required"}',
      'New content.',
      ':::',
    ].join('\n'))
    writeFileSync(join(root, 'src/routes/whats-new/+page.md'), '---\ntitle: What is new\nversionChanges:\n  exclude: true\n---\n# Changes')
    const value = manifest()
    value.current.routes = ['/guide/new/', '/guide/existing/', '/whats-new/']
    value.versions[0].routes = ['/guide/existing/']

    expect(computeVersionChangeSet(root, value)).toEqual({
      versionId: 'v9',
      baselineVersionId: '8.1.0',
      newPages: [{ route: '/guide/new/', title: 'New API', summary: 'Learn the API', sections: [] }],
      updatedPages: [{
        route: '/guide/existing/',
        title: 'Existing guide',
        sections: [{ id: 'hot-reload', title: 'Hot reload', summary: 'No restart required', introducedIn: 'v9' }],
      }],
    })
  })

  it('returns an explicit no-baseline change set without treating the site as new', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes'), { recursive: true })
    writeFileSync(join(root, 'src/routes/+page.md'), '# Home')
    const value = manifest()
    value.versions = []
    value.current.routes = ['/']
    expect(computeVersionChangeSet(root, value)).toEqual({
      versionId: 'v9',
      baselineVersionId: null,
      newPages: [],
      updatedPages: [],
    })
  })

  it('rejects malformed change metadata at the source file', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      ':::since[Broken marker]{version="missing" id="duplicate"}',
      'One.',
      ':::',
      ':::since[Duplicate marker]{version="v9" id="duplicate" unexpected="true"}',
      'Two.',
      ':::',
      ':::since[Malformed marker]{version="v9" id="malformed" bare}',
      'Three.',
      ':::',
    ].join('\n'))
    const value = manifest()
    value.current.routes = ['/guide/']
    expect(() => computeVersionChangeSet(root, value)).toThrow(/guide.*missing.*unexpected.*duplicate.*invalid attribute syntax/s)
  })

  it('discovers new Svelte pages without parsing paragraph markers from component source', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/playground'), { recursive: true })
    writeFileSync(join(root, 'src/routes/playground/+page.svelte'), [
      '<script lang="ts">',
      '  const example = `:::since[Example]{version="missing" id="example"}`',
      '</script>',
      '<h1>Playground</h1>',
    ].join('\n'))
    const value = manifest()
    value.current.routes = ['/playground/']
    value.versions[0].routes = []
    expect(computeVersionChangeSet(root, value).newPages).toEqual([
      { route: '/playground/', title: '/playground/', sections: [] },
    ])
  })

  it('ignores documented markers in code fences and falls back to the route title', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      '```md',
      ':::since[Example]{version="not-real" id="example"}',
      '```',
      '',
      '`:::since[Inline]{version="not-real" id="inline"}`',
    ].join('\n'))
    const value = manifest()
    value.current.routes = ['/guide/']
    value.versions[0].routes = []
    expect(computeVersionChangeSet(root, value).newPages).toEqual([
      { route: '/guide/', title: '/guide/', sections: [] },
    ])
  })

  it('ignores since-like text that is not a Markdown container directive', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(
      join(root, 'src/routes/guide/+page.md'),
      'A sentence with :::since[Inline]{version="v9" id="inline"} text.',
    )
    const value = manifest()
    value.current.routes = ['/guide/']
    value.versions[0].routes = ['/guide/']
    expect(computeVersionChangeSet(root, value).updatedPages).toEqual([])
  })

  it('rejects an unclosed since container that cannot render a stable anchor', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      ':::since[Open marker]{version="v9" id="open-marker"}',
      'This container never closes.',
    ].join('\n'))
    expect(() => computeVersionChangeSet(root, manifest())).toThrow(/since marker must be closed/)
  })

  it('rejects invalid versionChanges frontmatter types', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      '---',
      'versionChanges:',
      '  exclude: yes',
      '  summary: 42',
      '  extra: true',
      '---',
    ].join('\n'))
    let error = ''
    try {
      computeVersionChangeSet(root, manifest())
    }
    catch (caught) {
      error = (caught as Error).message
    }
    for (const field of ['exclude', 'summary', 'extra'])
      expect(error).toContain(field)
  })

  it('loads frozen historical changes and exposes them through the runtime', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    const snapshotRoot = join(root, 'src/routes/v/8.1.0')
    mkdirSync(snapshotRoot, { recursive: true })
    const changes = {
      versionId: '8.1.0',
      baselineVersionId: 'v7',
      newPages: [{ route: '/guide/', title: 'Guide', sections: [] }],
      updatedPages: [],
    }
    writeFileSync(join(snapshotRoot, '.sveltepress-version.json'), JSON.stringify({
      id: '8.1.0',
      routes: ['/guide/'],
      sharedDependencies: [],
      changes,
    }))
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(manifest()))

    const loaded = loadVersionManifest(root)
    const runtime = createVersionRuntime(loaded)
    expect(runtime.changeSets['8.1.0']).toEqual(changes)
    expect(runtime.resolveVersionChanges('8.1.0')).toEqual(changes)
    expect(runtime.resolveVersionChanges()).toEqual(loaded?.current.changes)
  })

  it('rejects corrupt frozen change metadata', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-changes-'))
    const snapshotRoot = join(root, 'src/routes/v/8.1.0')
    mkdirSync(snapshotRoot, { recursive: true })
    writeFileSync(join(snapshotRoot, '.sveltepress-version.json'), JSON.stringify({
      id: '8.1.0',
      routes: [],
      sharedDependencies: [],
      changes: { versionId: '8.1.0', baselineVersionId: null, newPages: [], updatedPages: 'broken' },
    }))
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(manifest()))
    expect(() => loadVersionManifest(root)).toThrow(/snapshot metadata changes\.updatedPages must be an array/)
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
