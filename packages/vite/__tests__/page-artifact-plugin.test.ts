import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SveltepressVitePlugin from '../src/plugin'
import {
  createVersionArtifactManifest,
  PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX,
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

  it('loads generated modules and their frozen source dependencies from an artifact', async () => {
    const store = mkdtempSync(join(tmpdir(), 'sveltepress-generated-artifact-plugin-'))
    process.env.SVELTEPRESS_ARTIFACT_STORE = store
    const generatedImport = `${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}live-code/demo.svelte`
    const frozenPreview = Uint8Array.from([0, 255, 137, 80, 78, 71])
    const generatedPixel = Uint8Array.from([0, 255, 1, 2, 3])
    const hash = await writePageArtifact(store, {
      route: '/guide/',
      files: {
        'client.js': `import Demo from '${generatedImport}'; export default Demo`,
        'server.js': `import Demo from '${generatedImport}'; export default Demo`,
        'metadata.json': JSON.stringify({ route: '/guide/', fm: {}, sourceFile: 'src/routes/guide/+page.md' }),
        'generated/live-code/demo.svelte': '<script>import Widget from \'$lib/Widget.svelte\'; import Local from \'./Local.svelte\'; import preview from \'./preview.png\'; import pkg from \'example-package\'</script><Widget /><Local />',
        'generated/images/pixel.png': generatedPixel,
        'sources/src/lib/Widget.svelte': '<strong>Frozen widget</strong>',
        'sources/src/routes/guide/Local.svelte': '<em>Frozen local widget</em>',
        'sources/src/routes/guide/preview.png': frozenPreview,
      },
    })
    const plugin = SveltepressVitePlugin({ siteConfig: {}, versions: false }) as Plugin
    const pageId = `\0${PAGE_ARTIFACT_VIRTUAL_PREFIX}${hash}/entry.js`

    const generatedId = await (plugin.resolveId as any)(generatedImport, pageId)
    expect(generatedId).toBe(`\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}${hash}/live-code/demo.svelte`)
    expect(await (plugin.load as any)(generatedId, { ssr: false })).toContain('import Widget from \'$lib/Widget.svelte\'')
    expect(await (plugin.load as any)(`${generatedId}?svelte&type=style&lang.css`, { ssr: false })).toBeNull()

    const dependency = await (plugin.resolveId as any)('$lib/Widget.svelte', generatedId)
    expect(dependency).toContain('page-artifact-source')
    expect(await (plugin.load as any)(dependency, { ssr: false })).toBe('<strong>Frozen widget</strong>')
    const localDependency = await (plugin.resolveId as any)('./Local.svelte', generatedId)
    expect(localDependency).toBe(`\0virtual:sveltepress/page-artifact-source/${hash}/src/routes/guide/Local.svelte`)
    expect(await (plugin.load as any)(localDependency, { ssr: false })).toBe('<em>Frozen local widget</em>')
    const assetDependency = await (plugin.resolveId as any)('./preview.png', generatedId)
    expect(assetDependency).toBe(`\0virtual:sveltepress/page-artifact-source/${hash}/src/routes/guide/preview.png`)
    const emitFile = vi.fn(() => 'preview-ref')
    expect(await (plugin.load as any).call({ emitFile }, assetDependency, { ssr: false })).toBe('export default import.meta.ROLLUP_FILE_URL_preview-ref')
    expect(emitFile).toHaveBeenCalledWith(expect.objectContaining({ type: 'asset', source: Buffer.from(frozenPreview) }))
    const generatedAssetId = await (plugin.resolveId as any)(`${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}images/pixel.png`, pageId)
    const emitGeneratedFile = vi.fn(() => 'pixel-ref')
    expect(await (plugin.load as any).call({ emitFile: emitGeneratedFile }, generatedAssetId, { ssr: false })).toBe('export default import.meta.ROLLUP_FILE_URL_pixel-ref')
    expect(emitGeneratedFile).toHaveBeenCalledWith(expect.objectContaining({ type: 'asset', source: Buffer.from(generatedPixel) }))
    expect(await (plugin.resolveId as any)('example-package', generatedId)).toBeNull()

    const missingId = `\0${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}${hash}/live-code/missing.svelte`
    await expect((plugin.load as any)(missingId, { ssr: false })).rejects.toThrow(/no generated file/i)
    writeFileSync(join(store, 'blobs', hash, 'generated/live-code/demo.svelte'), '<p>Corrupt</p>')
    await expect((plugin.load as any)(generatedId, { ssr: false })).rejects.toThrow(/file hash does not match/i)
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
