import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateVersionManifest } from '@sveltepress/vite/versioning'
import { describe, expect, it } from 'vitest'
import { runCli } from '../src/index'

// Editors validate a manifest against this schema through its `$schema` key,
// so it has to accept exactly what the CLI and the build accept.
const schema = JSON.parse(readFileSync(new URL('../schema/versions.schema.json', import.meta.url), 'utf8'))
const basePathPattern = new RegExp(schema.properties.basePath.pattern)

function acceptedByTheBuild(basePath: string) {
  try {
    validateVersionManifest({
      basePath,
      current: { id: '1.0', label: '1.0' },
      versions: [],
      content: { include: ['**'], exclude: [], shared: [] },
    })
    return true
  }
  catch {
    return false
  }
}

describe('versions.schema.json base path', () => {
  it.each([
    '/v',
    '/zh/v',
    '/bn/v',
    '/docs/archive-2',
    'v',
    '/v/',
    '/V',
    '//v',
    '/zh//v',
    '/a b',
    '',
  ])('agrees with the build about %j', (basePath) => {
    expect(basePathPattern.test(basePath)).toBe(acceptedByTheBuild(basePath))
  })

  it('accepts the manifest that `versions init --locale` writes', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-cli-schema-'))
    mkdirSync(join(root, 'src/routes/zh'), { recursive: true })
    writeFileSync(join(root, 'src/routes/zh/+page.md'), '# Home')
    const errors: string[] = []

    const code = await runCli(['versions', 'init', '--current', '1.0', '--locale', 'zh'], {
      cwd: root,
      stdout: () => {},
      stderr: value => errors.push(value),
    })

    expect(errors).toEqual([])
    expect(code).toBe(0)
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.zh.json'), 'utf8'))
    expect(manifest.basePath).toBe('/zh/v')
    expect(basePathPattern.test(manifest.basePath)).toBe(true)
  })

  it.each([
    'sveltepress.versions.json',
    'sveltepress.versions.zh.json',
    'sveltepress.versions.bn.json',
  ])('accepts the official %s', (file) => {
    const docsSite = fileURLToPath(new URL('../../docs-site/', import.meta.url))
    const manifest = JSON.parse(readFileSync(join(docsSite, file), 'utf8'))

    expect(basePathPattern.test(manifest.basePath), manifest.basePath).toBe(true)
  })
})
