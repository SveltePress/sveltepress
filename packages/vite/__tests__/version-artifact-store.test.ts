import type {
  PageArtifactInput,
  VersionArtifactFingerprints,
  VersionArtifactManifest,
} from '../src/versioning'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  buildInitialVersionArtifacts,
  buildVersionArtifacts,
  composeVersionArtifacts,
  createVersionArtifactManifest,
  planVersionBuild,
  readVersionArtifactManifest,
  validateStoredPageArtifact,
  writePageArtifact,
  writeVersionArtifactManifest,
} from '../src/versioning'

const fingerprints: VersionArtifactFingerprints = {
  artifactSchema: 'page-artifact-v1',
  pageCompiler: 'markdown-v1',
  shell: 'theme-v1',
  index: 'index-v1',
  planner: 'planner-v1',
}

function input(route: string, inputHash: string): PageArtifactInput {
  return { route, inputHash, files: [`${route}+page.md`], dependencies: [] }
}

function outputPath(route: string): string {
  return route === '/' ? 'index.html' : `${route.slice(1)}index.html`
}

async function seed(root: string, pages: PageArtifactInput[]): Promise<VersionArtifactManifest> {
  const records = []
  for (const page of pages) {
    const artifactHash = await writePageArtifact(root, {
      route: page.route,
      files: {
        [outputPath(page.route)]: `<main>${page.inputHash}</main>`,
        [`_app/${page.inputHash}.js`]: `export default ${JSON.stringify(page.inputHash)}`,
      },
    })
    records.push({ ...page, artifactHash })
  }
  const manifest = createVersionArtifactManifest({
    siteId: 'docs-en',
    versionId: 'v1',
    parent: null,
    fingerprints,
    pages: records,
    removedRoutes: [],
  })
  await writeVersionArtifactManifest(root, manifest)
  return manifest
}

describe('local version artifact store', () => {
  it('creates the first immutable baseline without a parent', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-store-initial-'))
    const pages = [input('/', 'home'), input('/guide/', 'guide')]
    const compile = vi.fn(async (page: PageArtifactInput) => ({ files: { [outputPath(page.route)]: page.inputHash } }))

    const result = await buildInitialVersionArtifacts({
      storeRoot: root,
      siteId: 'docs-en',
      versionId: 'v1',
      pages,
      fingerprints,
      compile,
    })

    expect(result.manifest.parent).toBeNull()
    expect(result.manifest.lineage).toEqual([])
    expect(result.report).toMatchObject({ compiledPages: 2, reusedPages: 0, fullRebuild: true })
    expect(compile).toHaveBeenCalledTimes(2)
  })

  it('compiles only planned pages and composes a complete site from reused blobs', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-store-'))
    const previousPages = [input('/', 'home-v1'), input('/guide/', 'guide-v1'), input('/api/', 'api-v1')]
    const previous = await seed(root, previousPages)
    const currentPages = [input('/', 'home-v1'), input('/guide/', 'guide-v2'), input('/new/', 'new-v2')]
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: currentPages,
      fingerprints,
    })
    const compile = vi.fn(async (page: PageArtifactInput) => ({
      files: {
        [outputPath(page.route)]: `<main>${page.inputHash}</main>`,
        [`_app/${page.inputHash}.js`]: `export default ${JSON.stringify(page.inputHash)}`,
      },
    }))

    const result = await buildVersionArtifacts({ storeRoot: root, previous, plan, compile })
    expect(compile.mock.calls.map(([page]) => page.route)).toEqual(['/guide/', '/new/'])
    expect(result.report).toMatchObject({
      compiledPages: 2,
      reusedPages: 1,
      removedRoutes: 1,
      recomposedPages: 3,
      fullRebuild: false,
    })
    expect(result.manifest.removedRoutes).toEqual(['/api/'])
    expect(readVersionArtifactManifest(root, 'docs-en', 'v2')).toEqual(result.manifest)

    const output = join(root, 'dist')
    await composeVersionArtifacts({ storeRoot: root, manifest: result.manifest, outputDirectory: output })
    expect(readFileSync(join(output, 'index.html'), 'utf8')).toContain('home-v1')
    expect(readFileSync(join(output, 'guide/index.html'), 'utf8')).toContain('guide-v2')
    expect(readFileSync(join(output, 'new/index.html'), 'utf8')).toContain('new-v2')
    expect(existsSync(join(output, 'api/index.html'))).toBe(false)
  })

  it('recomposes cached HTML through the current shell without compiling it again', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-store-'))
    const previous = await seed(root, [input('/', 'home'), input('/guide/', 'guide')])
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: [input('/', 'home'), input('/guide/', 'guide')],
      fingerprints: { ...fingerprints, shell: 'theme-v2' },
    })
    const compile = vi.fn()
    const { manifest } = await buildVersionArtifacts({ storeRoot: root, previous, plan, compile })
    const output = join(root, 'dist')
    await composeVersionArtifacts({
      storeRoot: root,
      manifest,
      outputDirectory: output,
      composeHtml: ({ route, html }) => `<body data-route="${route}">${html}</body>`,
    })

    expect(compile).not.toHaveBeenCalled()
    expect(readFileSync(join(output, 'guide/index.html'), 'utf8')).toBe('<body data-route="/guide/"><main>guide</main></body>')
  })

  it('fails closed when a reused blob is missing or corrupt', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-store-'))
    const previous = await seed(root, [input('/', 'home')])
    const page = previous.pages['/']
    rmSync(join(root, 'blobs', page.artifactHash), { recursive: true })
    const plan = planVersionBuild({
      siteId: 'docs-en',
      versionId: 'v2',
      previous,
      pages: [input('/', 'home')],
      fingerprints,
    })

    await expect(buildVersionArtifacts({
      storeRoot: root,
      previous,
      plan,
      compile: vi.fn(),
    })).rejects.toThrow(/missing.*artifact/i)
    expect(readVersionArtifactManifest(root, 'docs-en', 'v2')).toBeNull()

    const artifactHash = await writePageArtifact(root, { route: '/', files: { 'index.html': 'safe' } })
    writeFileSync(join(root, 'blobs', artifactHash, 'index.html'), 'tampered')
    await expect(validateStoredPageArtifact(root, artifactHash)).rejects.toThrow(/hash/i)
  })

  it('does not overwrite an immutable published manifest', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-store-'))
    const manifest = await seed(root, [input('/', 'home')])
    await expect(writeVersionArtifactManifest(root, {
      ...manifest,
      pages: {},
    })).rejects.toThrow(/already exists.*different/i)
  })
})
