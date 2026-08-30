import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createVersionArtifactManifest,
  generateVersionShellRoutes,
  writePageArtifact,
} from '../src/versioning'

const fingerprints = {
  artifactSchema: 'a1',
  pageCompiler: 'p1',
  shell: 's1',
  index: 'i1',
  planner: 'b1',
}

describe('version shell routes', () => {
  it('generates cheap current and historical wrappers while preserving shared route files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-shell-routes-'))
    const store = join(root, '.sveltepress/artifacts')
    const routes = join(root, 'src/routes')
    const output = join(root, '.sveltepress/shell-routes')
    mkdirSync(join(routes, 'guide'), { recursive: true })
    mkdirSync(join(routes, 'removed'), { recursive: true })
    writeFileSync(join(routes, '+layout.svelte'), '<slot />')
    writeFileSync(join(routes, 'guide/+page.md'), '# Current source must not be copied')
    writeFileSync(join(routes, 'guide/+page.ts'), 'export const prerender = true')
    writeFileSync(join(routes, 'removed/+page.md'), '# Removed current source')

    const guideHash = await artifact(store, '/guide/', 'Guide')
    const oldGuideHash = await artifact(store, '/guide/', 'Old guide')
    const removedHash = await artifact(store, '/removed/', 'Removed')
    const current = createVersionArtifactManifest({
      siteId: 'docs',
      versionId: 'v10',
      parent: null,
      fingerprints,
      pages: [record('/guide/', guideHash)],
      removedRoutes: ['/removed/'],
    })
    const historical = createVersionArtifactManifest({
      siteId: 'docs',
      versionId: 'v9',
      parent: null,
      fingerprints,
      pages: [record('/guide/', oldGuideHash), record('/removed/', removedHash)],
      removedRoutes: [],
    })

    const report = await generateVersionShellRoutes({
      siteRoot: root,
      storeRoot: store,
      outputDirectory: output,
      basePath: '/v',
      pageLayout: '@sveltepress/theme-default/PageLayout.svelte',
      current,
      historical: [historical],
    })

    expect(report).toEqual({ currentRoutes: 1, historicalRoutes: 2, copiedSupportFiles: 2 })
    expect(readFileSync(join(output, 'guide/+page.svelte'), 'utf8')).toContain(guideHash)
    expect(readFileSync(join(output, 'v/v9/guide/+page.svelte'), 'utf8')).toContain(oldGuideHash)
    expect(readFileSync(join(output, 'v/v9/removed/+page.svelte'), 'utf8')).toContain(removedHash)
    expect(readFileSync(join(output, 'guide/+page.ts'), 'utf8')).toContain('prerender')
    expect(readFileSync(join(output, '+layout.svelte'), 'utf8')).toBe('<slot />')
    expect(existsSync(join(output, 'removed/+page.svelte'))).toBe(false)
    expect(existsSync(join(output, 'guide/+page.md'))).toBe(false)
  })
})

async function artifact(store: string, route: string, title: string) {
  return writePageArtifact(store, {
    route,
    files: {
      'client.js': 'export default function Page() {}',
      'server.js': 'export default function Page() {}',
      'metadata.json': JSON.stringify({ route, fm: { title }, sourceFile: `src/routes${route === '/' ? '' : route.slice(0, -1)}/+page.md` }),
    },
  })
}

function record(route: string, artifactHash: string) {
  return { route, artifactHash, inputHash: `${route}-input`, files: [`${route}/+page.md`], dependencies: [] }
}
