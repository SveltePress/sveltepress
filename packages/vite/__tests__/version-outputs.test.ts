import type { VersionManifest } from '../src/versioning'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

  it('writes build outputs to a custom directory and reads frozen artifact-shell sources', () => {
    const { root, manifest } = fixture()
    const output = join(root, 'build-client')
    const store = join(root, 'artifacts')
    const hash = 'a'.repeat(64)
    const blob = join(store, 'blobs', hash)
    const historicalRoute = join(root, 'src/routes/v/v8/guide/+page.svelte')
    rmSync(join(root, 'src/routes/v/v8/guide/+page.md'))
    mkdirSync(join(blob, 'sources/src/routes/guide'), { recursive: true })
    writeFileSync(join(blob, 'metadata.json'), JSON.stringify({ sourceFile: 'src/routes/guide/+page.md' }))
    writeFileSync(join(blob, 'sources/src/routes/guide/+page.md'), '---\ntitle: Frozen guide\n---\nFrozen body')
    writeFileSync(historicalRoute, `<script>import Content from 'virtual:sveltepress/page-artifact/${hash}'</script>\n<!-- sveltepress:artifact-shell -->`)
    const previousStore = process.env.SVELTEPRESS_ARTIFACT_STORE
    const filteredPaths: string[] = []
    process.env.SVELTEPRESS_ARTIFACT_STORE = store
    try {
      generateLlmsTxt({
        enabled: true,
        filter: (filePath) => {
          filteredPaths.push(filePath)
          return filePath.endsWith('.md')
        },
      }, { title: 'Docs' }, manifest, root, output)
      generateVersionSitemap(manifest, root, 'https://docs.example.com', output)
    }
    finally {
      if (previousStore === undefined)
        delete process.env.SVELTEPRESS_ARTIFACT_STORE
      else
        process.env.SVELTEPRESS_ARTIFACT_STORE = previousStore
    }
    expect(readFileSync(join(output, 'v/v8/llms-full.txt'), 'utf8')).toContain('Frozen body')
    expect(readFileSync(join(output, 'v/v8/llms.txt'), 'utf8')).toContain('[Frozen guide](/v/v8/guide)')
    expect(readFileSync(join(output, 'sitemap.xml'), 'utf8')).toContain('https://docs.example.com/v/v8/guide/')
    expect(filteredPaths).toContain(join(root, 'src/routes/guide/+page.md'))
    expect(filteredPaths.some(filePath => filePath.endsWith('+page.svelte'))).toBe(false)
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
