import type { Plugin } from 'vite'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import SveltepressVitePlugin from '../src/plugin'
import {
  createVersionArtifactManifest,
  PAGE_ARTIFACT_VIRTUAL_PREFIX,
  writeDraftVersionArtifactManifest,
  writePageArtifact,
} from '../src/versioning'

describe('page artifact vite integration', () => {
  const previousStore = process.env.SVELTEPRESS_ARTIFACT_STORE
  const previousSiteId = process.env.SVELTEPRESS_ARTIFACT_SITE_ID

  afterEach(() => {
    if (previousStore === undefined)
      delete process.env.SVELTEPRESS_ARTIFACT_STORE
    else
      process.env.SVELTEPRESS_ARTIFACT_STORE = previousStore
    if (previousSiteId === undefined)
      delete process.env.SVELTEPRESS_ARTIFACT_SITE_ID
    else
      process.env.SVELTEPRESS_ARTIFACT_SITE_ID = previousSiteId
  })

  it('loads precompiled client/server modules and leaves shell wrappers cheap', async () => {
    const store = mkdtempSync(join(tmpdir(), 'sveltepress-artifact-plugin-'))
    process.env.SVELTEPRESS_ARTIFACT_STORE = store
    const hash = await writePageArtifact(store, {
      route: '/guide/',
      files: {
        'client.js': 'import Widget from \'./Widget.svelte\'; export default Widget',
        'server.js': 'export default "server"',
        'metadata.json': JSON.stringify({ route: '/guide/', fm: {}, sourceFile: 'src/routes/guide/+page.svelte' }),
        'sources/src/routes/guide/Widget.svelte': '<strong>Frozen widget</strong>',
      },
    })
    const plugin = SveltepressVitePlugin({ siteConfig: {}, versions: false }) as Plugin
    const id = `${PAGE_ARTIFACT_VIRTUAL_PREFIX}${hash}`
    const resolved = await (plugin.resolveId as any)(id)

    expect(resolved).toBe(`\0${id}/entry.js`)
    expect(await (plugin.load as any)(resolved, { ssr: false })).toContain('import Widget from \'./Widget.svelte\'')
    expect(await (plugin.load as any)(resolved, { ssr: true })).toBe('export default "server"')
    const dependency = await (plugin.resolveId as any)('./Widget.svelte', resolved)
    expect(dependency).toContain('page-artifact-source')
    expect(await (plugin.load as any)(dependency, { ssr: false })).toBe('<strong>Frozen widget</strong>')

    const wrapper = '<!-- sveltepress:artifact-shell -->\n<h1>Wrapper</h1>'
    expect(await (plugin.transform as any)(wrapper, '/site/src/routes/guide/+page.svelte')).toBe(wrapper)
  })

  it('replaces current source pages with their built artifact wrappers during composition', async () => {
    const store = mkdtempSync(join(tmpdir(), 'sveltepress-artifact-current-'))
    process.env.SVELTEPRESS_ARTIFACT_STORE = store
    process.env.SVELTEPRESS_ARTIFACT_SITE_ID = 'docs'
    const hash = await writePageArtifact(store, {
      route: '/guide/',
      files: {
        'client.js': 'export default "client"',
        'server.js': 'export default "server"',
        'metadata.json': JSON.stringify({ route: '/guide/', fm: { title: 'Guide' }, sourceFile: 'src/routes/guide/+page.md' }),
      },
    })
    writeDraftVersionArtifactManifest(store, createVersionArtifactManifest({
      siteId: 'docs',
      versionId: 'v9',
      parent: null,
      fingerprints: {
        artifactSchema: 'schema',
        pageCompiler: 'compiler',
        shell: 'shell',
        index: 'index',
        planner: 'planner',
      },
      pages: [{ route: '/guide/', inputHash: 'input', artifactHash: hash, files: ['src/routes/guide/+page.md'], dependencies: [] }],
      removedRoutes: [],
    }))

    const plugin = SveltepressVitePlugin({
      siteConfig: {},
      versions: false,
      theme: { pageLayout: 'PageLayout.svelte' } as any,
    }) as Plugin
    const transformed = await (plugin.transform as any)('# changed source', '/site/src/routes/guide/+page.md')

    expect(transformed).toContain('<!-- sveltepress:artifact-shell -->')
    expect(transformed).toContain(`${PAGE_ARTIFACT_VIRTUAL_PREFIX}${hash}`)
    expect(transformed).toContain('"title":"Guide"')
    expect(transformed).not.toContain('changed source')
  })
})
