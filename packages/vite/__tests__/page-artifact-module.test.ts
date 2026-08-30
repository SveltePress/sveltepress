import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  compilePageArtifactModule,
  createArtifactPageWrapper,
  readPageArtifactModule,
  writePageArtifact,
} from '../src/versioning'

describe('page artifact modules', () => {
  it('compiles reusable client and server content without the page shell', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-page-module-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    const source = '---\ntitle: Guide\n---\n\n# Reusable content\n'
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, source)

    const artifact = await compilePageArtifactModule({ filename, source })
    expect(Object.keys(artifact.files).sort()).toEqual(['client.js', 'metadata.json', 'server.js'])
    expect(String(artifact.files['client.js'])).toContain('svelte/internal/client')
    expect(String(artifact.files['server.js'])).toContain('svelte/internal/server')
    expect(JSON.parse(String(artifact.files['metadata.json']))).toMatchObject({
      route: '/guide/',
      fm: { title: 'Guide', pageType: 'md' },
    })
    expect(String(artifact.files['client.js'])).not.toContain('PageLayout')
  })

  it('creates a cheap shell wrapper and resolves the correct compiled target', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-page-module-store-'))
    const artifactHash = await writePageArtifact(root, {
      route: '/guide/',
      files: {
        'client.js': 'export default "client"',
        'server.js': 'export default "server"',
        'metadata.json': JSON.stringify({ route: '/guide/', fm: { title: 'Guide' }, sourceFile: 'src/routes/guide/+page.md' }),
      },
    })

    expect(createArtifactPageWrapper({
      artifactHash,
      fm: { title: 'Guide' },
      pageLayout: '@sveltepress/theme-default/PageLayout.svelte',
    })).toContain(`virtual:sveltepress/page-artifact/${artifactHash}`)
    expect(await readPageArtifactModule(root, artifactHash, 'client')).toBe('export default "client"')
    expect(await readPageArtifactModule(root, artifactHash, 'server')).toBe('export default "server"')
  })

  it('keeps page scripts and frontmatter available inside the reusable content component', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-page-state-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    const source = [
      '---',
      'title: Stateful guide',
      '---',
      '<div>',
      '<script>',
      '  const items = [\'one\', \'two\']',
      '</script>',
      '{#each items as item}<span>{item}</span>{/each}',
      '<pre>{fm.title}</pre>',
      '</div>',
    ].join('\n')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, source)

    const artifact = await compilePageArtifactModule({ filename, source })
    const server = String(artifact.files['server.js'])
    expect(server).toContain('const items = [\'one\', \'two\']')
    expect(server).toContain('const fm = {')
    expect(server).toContain('"title": "Stateful guide"')
    expect(server).not.toContain('$$renderer.push(`<script>')
  })
})
