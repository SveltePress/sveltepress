import type {
  PageArtifactInput,
  VersionArtifactFingerprints,
  VersionArtifactManifest,
} from '../src/versioning'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  artifactManifestHash,
  collectPageArtifactInputs,
  createVersionArtifactManifest,
  planVersionBuild,
  validateVersionArtifactManifest,
} from '../src/versioning'

const fingerprints: VersionArtifactFingerprints = {
  artifactSchema: 'page-artifact-v1',
  pageCompiler: 'markdown-v1',
  shell: 'theme-v1',
  index: 'index-v1',
  planner: 'planner-v1',
}

function page(route: string, inputHash: string): PageArtifactInput {
  return {
    route,
    inputHash,
    files: [`src/routes${route === '/' ? '' : route.slice(0, -1)}/+page.md`],
    dependencies: [],
  }
}

function baseline(pages: PageArtifactInput[], overrides: Partial<VersionArtifactManifest> = {}): VersionArtifactManifest {
  return createVersionArtifactManifest({
    siteId: 'docs-en',
    versionId: 'v1',
    parent: null,
    fingerprints,
    pages: pages.map(input => ({
      ...input,
      artifactHash: `artifact-${input.inputHash}`,
    })),
    removedRoutes: [],
    ...overrides,
  })
}

describe('incremental version artifacts', () => {
  it('compiles only two changed pages regardless of historical depth', () => {
    const previousPages = Array.from({ length: 30 }, (_, index) => page(`/page-${index}/`, `hash-${index}`))
    const previous = baseline(previousPages, {
      lineage: Array.from({ length: 20 }, (_, index) => ({ versionId: `v${index}`, manifestHash: `history-${index}` })),
    })
    const current = previousPages.map(input => ({ ...input }))
    current[4] = page('/page-4/', 'changed-4')
    current[19] = page('/page-19/', 'changed-19')

    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: current,
      fingerprints,
    })
    expect(plan).toMatchObject({
      compiledRoutes: ['/page-19/', '/page-4/'],
      removedRoutes: [],
      fullRebuild: false,
      invalidationReasons: [],
    })
    expect(plan.reusedRoutes).toHaveLength(28)
    expect(plan.recomposedRoutes).toHaveLength(30)
  })

  it('records removed routes as tombstones and treats a rename as remove plus add', () => {
    const previous = baseline([page('/old/', 'old'), page('/keep/', 'keep')])
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: [page('/new/', 'new'), page('/keep/', 'keep')],
      fingerprints,
    })

    expect(plan.compiledRoutes).toEqual(['/new/'])
    expect(plan.removedRoutes).toEqual(['/old/'])
    expect(plan.reusedRoutes).toEqual(['/keep/'])
  })

  it('recomposes without recompiling pages when only the shell changes', () => {
    const pages = [page('/', 'home'), page('/guide/', 'guide')]
    const previous = baseline(pages)
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages,
      fingerprints: { ...fingerprints, shell: 'theme-v2' },
    })

    expect(plan).toMatchObject({
      compiledRoutes: [],
      reusedRoutes: ['/', '/guide/'],
      recomposedRoutes: ['/', '/guide/'],
      fullRebuild: false,
      invalidationReasons: ['shell fingerprint changed'],
    })
  })

  it('fully rebuilds page artifacts when the compiler or artifact schema changes', () => {
    const pages = [page('/', 'home'), page('/guide/', 'guide')]
    const previous = baseline(pages)
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages,
      fingerprints: {
        ...fingerprints,
        pageCompiler: 'markdown-v2',
        artifactSchema: 'page-artifact-v2',
      },
    })

    expect(plan.compiledRoutes).toEqual(['/', '/guide/'])
    expect(plan.reusedRoutes).toEqual([])
    expect(plan.fullRebuild).toBe(true)
    expect(plan.invalidationReasons).toEqual([
      'artifact schema changed',
      'page compiler fingerprint changed',
    ])
  })

  it('hashes manifests deterministically and validates the parent content hash', () => {
    const previous = baseline([page('/', 'home')])
    const parentHash = artifactManifestHash(previous)
    const current = createVersionArtifactManifest({
      siteId: 'docs-en',
      versionId: 'v2',
      parent: { versionId: 'v1', manifestHash: parentHash },
      fingerprints,
      pages: [{ ...page('/', 'home'), artifactHash: 'artifact-home' }],
      removedRoutes: [],
    })

    expect(artifactManifestHash(current)).toBe(artifactManifestHash(JSON.parse(JSON.stringify(current))))
    expect(() => validateVersionArtifactManifest(current, previous)).not.toThrow()
    expect(() => validateVersionArtifactManifest({
      ...current,
      parent: { versionId: 'v1', manifestHash: 'corrupt' },
    }, previous)).toThrow(/parent manifest hash/i)
  })

  it('changes only pages affected by route-local and transitive dependencies', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-artifacts-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    mkdirSync(join(root, 'src/routes/reference'), { recursive: true })
    mkdirSync(join(root, 'src/lib'), { recursive: true })
    writeFileSync(join(root, 'src/routes/+page.md'), '# Home')
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '<script>import Card from \'$lib/Card.svelte\'</script>\n# Guide')
    writeFileSync(join(root, 'src/routes/reference/+page.svelte'), '<h1>Reference</h1>')
    writeFileSync(join(root, 'src/lib/Card.svelte'), '<article>One</article>')

    const before = collectPageArtifactInputs(root, { basePath: '/v' })
    writeFileSync(join(root, 'src/lib/Card.svelte'), '<article>Two</article>')
    const after = collectPageArtifactInputs(root, { basePath: '/v' })
    const previous = baseline(before)
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: after,
      fingerprints,
    })

    expect(plan.compiledRoutes).toEqual(['/guide/'])
    expect(plan.reusedRoutes).toEqual(['/', '/reference/'])
    expect(after.find(input => input.route === '/guide/')?.dependencies).toContain('src/lib/Card.svelte')
  })

  it('hashes legacy snapshot and current route roots by the same logical paths', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-artifact-paths-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    mkdirSync(join(root, 'src/routes/v/v8/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Same guide')
    writeFileSync(join(root, 'src/routes/v/v8/guide/+page.md'), '# Same guide')

    const current = collectPageArtifactInputs(root, { basePath: '/v' })
    const historical = collectPageArtifactInputs(root, {
      basePath: '/unused',
      routesDir: 'src/routes/v/v8',
    })
    expect(historical[0].inputHash).toBe(current[0].inputHash)
  })
})
