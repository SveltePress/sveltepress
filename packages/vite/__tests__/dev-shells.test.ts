import type { Plugin } from 'vite'
import type { VersionManifest } from '../src/versioning'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import sveltepress from '../src/plugin'

// Mock the shell-route generator so the test focuses on mount orchestration:
// which historical versions get mounted, marker files, env, and cleanup —
// without requiring real compiled artifact blobs.
const generateVersionShellRoutes = vi.fn()
vi.mock('../src/versioning/index.js', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    generateVersionShellRoutes: (input: { outputDirectory: string, basePath: string, historical: Array<{ versionId: string }> }) => {
      generateVersionShellRoutes(input)
      const segments = input.basePath.split('/').filter(Boolean)
      for (const version of input.historical) {
        const root = join(input.outputDirectory, ...segments, version.versionId, 'guide')
        mkdirSync(root, { recursive: true })
        writeFileSync(join(root, '+page.svelte'), '<!-- sveltepress:artifact-shell -->\n<h1>Shell</h1>')
      }
      return Promise.resolve({ currentRoutes: 0, historicalRoutes: input.historical.length, copiedSupportFiles: 0 })
    },
  }
})

const originalCwd = process.cwd()

beforeEach(() => {
  generateVersionShellRoutes.mockClear()
})

afterEach(() => {
  process.chdir(originalCwd)
  delete process.env.SVELTEPRESS_ARTIFACT_STORE
  delete process.env.SVELTEPRESS_ARTIFACT_SITE_ID
  vi.restoreAllMocks()
})

function manifestWithArtifacts(): VersionManifest {
  return {
    basePath: '/v',
    current: { id: 'v9', label: '9.x', routes: ['/guide/'] },
    versions: [
      { id: 'v8', label: '8.x', routes: ['/guide/'], status: 'stable', sourceHash: 'a'.repeat(64) },
      { id: 'v7', label: '7.x', routes: ['/guide/'], status: 'stable', sourceHash: 'b'.repeat(64) },
    ],
    content: { include: ['**'], exclude: [], shared: [] },
    artifacts: { mode: 'incremental', siteId: 'demo-site', store: '.sveltepress/version-artifacts', sources: 'version-deltas' },
  }
}

function writeArtifactManifest(store: string, versionId: string) {
  mkdirSync(join(store, 'manifests/demo-site'), { recursive: true })
  writeFileSync(join(store, 'manifests/demo-site', `${versionId}.json`), JSON.stringify({
    schemaVersion: 1,
    siteId: 'demo-site',
    versionId,
    parent: null,
    fingerprints: { artifactSchema: 'a', pageCompiler: 'b', shell: 'c', index: 'd', planner: 'e' },
    pages: {},
    removedRoutes: [],
    lineage: [],
  }))
}

function writeDraft(store: string) {
  mkdirSync(join(store, 'drafts'), { recursive: true })
  writeFileSync(join(store, 'drafts/demo-site.json'), JSON.stringify({
    schemaVersion: 1,
    siteId: 'demo-site',
    versionId: 'v9',
    parent: null,
    fingerprints: { artifactSchema: 'a', pageCompiler: 'b', shell: 'c', index: 'd', planner: 'e' },
    pages: {},
    removedRoutes: [],
    lineage: [],
  }))
}

describe('dev historical version route mounting', () => {
  function shellFixture() {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-dev-shells-'))
    const routesDir = join(root, 'src/routes')
    mkdirSync(join(routesDir, 'guide'), { recursive: true })
    writeFileSync(join(routesDir, 'guide/+page.md'), '---\ntitle: Guide\n---\n# Guide')
    const store = join(root, '.sveltepress/version-artifacts')
    writeArtifactManifest(store, 'v8')
    writeArtifactManifest(store, 'v7')
    writeDraft(store)
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(manifestWithArtifacts()))
    return { root, routesDir, store }
  }

  it('mounts historical shell routes only when a real dev server starts', async () => {
    const { root, routesDir, store } = shellFixture()
    process.chdir(root)
    const watcherAdd = vi.fn()
    const plugin = sveltepress({
      versions: {},
      theme: { pageLayout: '@sveltepress/theme-default/PageLayout.svelte' } as never,
    }) as Plugin

    // Sync-only resolution (svelte-kit sync / svelte-check load-config) resolves
    // Vite with command 'serve' but never starts a server: nothing may mount.
    await (plugin.configResolved as (config: unknown) => void | Promise<void>)({ command: 'serve', build: {}, plugins: [] })
    expect(existsSync(join(routesDir, 'v/v8'))).toBe(false)
    expect(process.env.SVELTEPRESS_ARTIFACT_STORE).toBeUndefined()
    expect(process.env.SVELTEPRESS_ARTIFACT_SITE_ID).toBeUndefined()

    // A real dev server lifecycle (configureServer) mounts the shells.
    await (plugin.configureServer as (server: unknown) => void | Promise<void>)({ watcher: { add: watcherAdd }, httpServer: { on: vi.fn() } })
    expect(readFileSync(join(routesDir, 'v/v8/guide/+page.svelte'), 'utf8')).toContain('sveltepress:artifact-shell')
    expect(readFileSync(join(routesDir, 'v/v7/guide/+page.svelte'), 'utf8')).toContain('sveltepress:artifact-shell')
    expect(readFileSync(join(routesDir, 'v/v8/.sveltepress-dev-shell.json'), 'utf8')).toContain('"versionId":"v8"')
    expect(readFileSync(join(routesDir, 'v/v7/.sveltepress-dev-shell.json'), 'utf8')).toContain('"versionId":"v7"')
    expect(existsSync(join(routesDir, 'v/v9'))).toBe(false)
    // env is set so artifact virtual modules resolve in dev
    expect(realpathSync(process.env.SVELTEPRESS_ARTIFACT_STORE!)).toBe(realpathSync(store))
    expect(process.env.SVELTEPRESS_ARTIFACT_SITE_ID).toBe('demo-site')
    // graceful shutdown (server.close()) removes the mounted dev shells
    expect(existsSync(join(routesDir, 'v/v8'))).toBe(true)
    await (plugin.closeBundle as () => void | Promise<void>)()
    expect(existsSync(join(routesDir, 'v/v8'))).toBe(false)
    expect(existsSync(join(routesDir, 'v/v7'))).toBe(false)
  })

  it('removes residual marker-scoped shells on sync-only config resolution', async () => {
    const { root, routesDir } = shellFixture()
    // Simulate shells left behind by a hard-killed dev server.
    mkdirSync(join(routesDir, 'v/v8/guide'), { recursive: true })
    writeFileSync(join(routesDir, 'v/v8/.sveltepress-dev-shell.json'), JSON.stringify({ siteId: 'demo-site', versionId: 'v8' }))
    process.chdir(root)
    const plugin = sveltepress({
      versions: {},
      theme: { pageLayout: '@sveltepress/theme-default/PageLayout.svelte' } as never,
    }) as Plugin
    await (plugin.configResolved as (config: unknown) => void | Promise<void>)({ command: 'serve', build: {}, plugins: [] })
    expect(existsSync(join(routesDir, 'v/v8'))).toBe(false)
    expect(process.env.SVELTEPRESS_ARTIFACT_STORE).toBeUndefined()
  })

  it('does not mount anything without incremental artifacts', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-dev-shells-none-'))
    mkdirSync(join(root, 'src/routes'), { recursive: true })
    const manifest: VersionManifest = {
      basePath: '/v',
      current: { id: 'v9', label: '9.x' },
      versions: [{ id: 'v8', label: '8.x', routes: ['/guide/'], status: 'stable' }],
      content: { include: ['**'], exclude: [], shared: [] },
    }
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(manifest))
    process.chdir(root)
    const plugin = sveltepress({ versions: {} }) as Plugin
    await (plugin.configResolved as (config: unknown) => void | Promise<void>)({ command: 'serve', build: {}, plugins: [] })
    ;(plugin.configureServer as (server: unknown) => void)({ watcher: { add: vi.fn() }, httpServer: { on: vi.fn() } })
    expect(process.env.SVELTEPRESS_ARTIFACT_STORE).toBeUndefined()
    expect(process.env.SVELTEPRESS_ARTIFACT_SITE_ID).toBeUndefined()
    expect(generateVersionShellRoutes).not.toHaveBeenCalled()
  })

  it('does not replace current source pages with artifact wrappers in dev mode', async () => {
    const { root, routesDir } = shellFixture()
    process.chdir(root)
    const plugin = sveltepress({
      versions: {},
      theme: { pageLayout: '@sveltepress/theme-default/PageLayout.svelte' } as never,
    }) as Plugin
    await (plugin.configResolved as (config: unknown) => void | Promise<void>)({ command: 'serve', build: {}, plugins: [] })
    process.env.SVELTEPRESS_ARTIFACT_STORE = root
    process.env.SVELTEPRESS_ARTIFACT_SITE_ID = 'demo-site'
    const transformed = await (plugin.transform as any)('# Live source content', join(routesDir, 'guide/+page.md'))
    expect(transformed).not.toContain('<!-- sveltepress:artifact-shell -->')
    expect(transformed).toContain('Live source content')
  })
})
