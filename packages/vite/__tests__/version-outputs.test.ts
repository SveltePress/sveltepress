import type { VersionManifest } from '../src/versioning'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateLlmsTxt } from '../src/llms'
import { generateVersionSitemap } from '../src/versioning/output'

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-outputs-'))
  mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
  mkdirSync(join(root, 'src/routes/v/v8/guide'), { recursive: true })
  mkdirSync(join(root, 'src/routes/v/v7'), { recursive: true })
  writeFileSync(join(root, 'src/routes/guide/+page.md'), '---\ntitle: Current guide\n---\nCurrent only')
  writeFileSync(join(root, 'src/routes/v/v8/guide/+page.md'), '---\ntitle: Version 8 guide\n---\nVersion 8 only')
  writeFileSync(join(root, 'src/routes/v/v7/+page.md'), '# Version 7')
  const manifest: VersionManifest = {
    basePath: '/v',
    current: { id: 'v9', label: '9.x', routes: ['/guide/'] },
    versions: [
      { id: 'v8', label: '8.x', status: 'deprecated', routes: ['/guide/'] },
      { id: 'v7', label: '7.x', status: 'eol', routes: ['/'] },
    ],
    content: { include: ['**'], exclude: [], shared: [] },
  }
  return { root, manifest }
}

describe('version-aware build outputs', () => {
  it('writes one isolated llms pair per documentation version', () => {
    const { root, manifest } = fixture()
    generateLlmsTxt({ enabled: true, baseUrl: 'https://docs.example.com' }, { title: 'Docs' }, manifest, root)
    const current = readFileSync(join(root, 'static/llms-full.txt'), 'utf8')
    const historical = readFileSync(join(root, 'static/v/v8/llms-full.txt'), 'utf8')
    expect(current).toContain('Current only')
    expect(current).not.toContain('Version 8 only')
    expect(historical).toContain('Version 8 only')
    expect(historical).not.toContain('Current only')
    expect(historical).toContain('https://docs.example.com/v/v8/guide')
  })

  it('includes supported routes in sitemap and excludes EOL by default', () => {
    const { root, manifest } = fixture()
    generateVersionSitemap(manifest, root, 'https://docs.example.com')
    const sitemap = readFileSync(join(root, 'static/sitemap.xml'), 'utf8')
    expect(sitemap).toContain('https://docs.example.com/guide/')
    expect(sitemap).toContain('https://docs.example.com/v/v8/guide/')
    expect(sitemap).not.toContain('/v/v7/')
  })

  it('includes an EOL version only when noIndex is explicitly disabled', () => {
    const { root, manifest } = fixture()
    manifest.versions[1].noIndex = false
    generateVersionSitemap(manifest, root, 'https://docs.example.com')
    expect(readFileSync(join(root, 'static/sitemap.xml'), 'utf8')).toContain('https://docs.example.com/v/v7/')
  })
})
