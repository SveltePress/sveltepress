import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createVersionArtifactManifest,
  materializeVersionSourceDeltas,
  writeVersionSourceDelta,
} from '../src/versioning'

const fingerprints = { artifactSchema: 'a', pageCompiler: 'p', shell: 's', index: 'i', planner: 'b' }

describe('version source deltas', () => {
  it('stores a full base then only changed source pages and can reconstruct the lineage', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-source-deltas-'))
    const routes = join(root, 'src/routes')
    const deltas = join(root, 'version-deltas')
    mkdirSync(join(routes, 'one'), { recursive: true })
    mkdirSync(join(routes, 'two'), { recursive: true })
    writeFileSync(join(routes, 'one/+page.md'), '# One v1')
    writeFileSync(join(routes, 'two/+page.md'), '# Two v1')
    const v1 = version('v1', [page('/one/', 'one-v1'), page('/two/', 'two-v1')])
    writeVersionSourceDelta({ siteRoot: root, sourceRoot: deltas, sourceRoutesDirectory: routes, manifest: v1, metadata: metadata('v1') })

    writeFileSync(join(routes, 'two/+page.md'), '# Two v2')
    mkdirSync(join(routes, 'three'), { recursive: true })
    writeFileSync(join(routes, 'three/+page.md'), '# Three v2')
    const v2 = version('v2', [page('/one/', 'one-v1'), page('/two/', 'two-v2'), page('/three/', 'three-v2')], v1, [])
    const delta = writeVersionSourceDelta({ siteRoot: root, sourceRoot: deltas, sourceRoutesDirectory: routes, manifest: v2, previous: v1, metadata: metadata('v2') })

    expect(delta.pages.map(item => item.route)).toEqual(['/three/', '/two/'])
    expect(existsSync(join(deltas, 'v2/files/src/routes/one/+page.md'))).toBe(false)
    const reconstructed = join(root, 'reconstructed')
    materializeVersionSourceDeltas({ sourceRoot: deltas, versionIds: ['v1', 'v2'], outputDirectory: reconstructed })
    expect(readFileSync(join(reconstructed, 'src/routes/one/+page.md'), 'utf8')).toBe('# One v1')
    expect(readFileSync(join(reconstructed, 'src/routes/two/+page.md'), 'utf8')).toBe('# Two v2')
    expect(readFileSync(join(reconstructed, 'src/routes/three/+page.md'), 'utf8')).toBe('# Three v2')
  })

  it('does not store unchanged sources when only compiled artifacts change', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-source-deltas-'))
    const routes = join(root, 'src/routes')
    const deltas = join(root, 'version-deltas')
    mkdirSync(join(routes, 'one'), { recursive: true })
    writeFileSync(join(routes, 'one/+page.md'), '# One')
    const v1 = version('v1', [page('/one/', 'artifact-v1', 'source-v1')])
    writeVersionSourceDelta({ siteRoot: root, sourceRoot: deltas, sourceRoutesDirectory: routes, manifest: v1, metadata: metadata('v1') })
    const v2 = version('v2', [page('/one/', 'artifact-v2', 'source-v1')], v1)

    const delta = writeVersionSourceDelta({ siteRoot: root, sourceRoot: deltas, sourceRoutesDirectory: routes, manifest: v2, previous: v1, metadata: metadata('v2') })

    expect(delta.pages).toEqual([])
  })
})

function page(route: string, artifactHash: string, inputHash = artifactHash) {
  return {
    route,
    artifactHash,
    inputHash,
    files: [`src/routes/${route.slice(1)}+page.md`],
    dependencies: [],
  }
}

function metadata(id: string) {
  return { id, label: id, status: 'stable' as const, routes: ['/one/'] }
}

function version(id: string, pages: ReturnType<typeof page>[], previous?: ReturnType<typeof version>, removedRoutes: string[] = []) {
  return createVersionArtifactManifest({
    siteId: 'docs',
    versionId: id,
    parent: previous ? { versionId: previous.versionId, manifestHash: 'parent' } : null,
    fingerprints,
    pages,
    removedRoutes,
  })
}
