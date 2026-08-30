import type { Plugin } from 'unified'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { wrapPage } from '../src/utils/wrap-page'
import {
  compilePageArtifactModule,
  createArtifactPageWrapper,
  emitPageArtifactFile,
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

  it('emits safe generated files idempotently through the artifact compiler', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-generated-page-module-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, '# Generated')
    const emitter: Plugin = () => (_tree, vFile) => {
      const generated = { path: 'examples/Demo.svelte', content: '<h1>Demo</h1>' }
      expect(emitPageArtifactFile(vFile, generated)).toBe('virtual:sveltepress/page-artifact-generated/examples/Demo.svelte')
      expect(emitPageArtifactFile(vFile, generated)).toBe('virtual:sveltepress/page-artifact-generated/examples/Demo.svelte')
      expect(emitPageArtifactFile(vFile, {
        path: 'images/pixel.png',
        content: Uint8Array.from([0, 255, 137, 80]),
      })).toBe('virtual:sveltepress/page-artifact-generated/images/pixel.png')
    }

    const artifact = await compilePageArtifactModule({ filename, source: '# Generated', remarkPlugins: [emitter] })

    expect(artifact.files['generated/examples/Demo.svelte']).toBe('<h1>Demo</h1>')
    expect(artifact.files['generated/images/pixel.png']).toEqual(Uint8Array.from([0, 255, 137, 80]))
  })

  it('rejects unsafe and conflicting generated files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-invalid-generated-page-module-'))
    const filename = join(root, 'src/routes/guide/+page.md')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(filename, '# Generated')
    const unsafe: Plugin = () => (_tree, vFile) => {
      emitPageArtifactFile(vFile, { path: '../escape.svelte', content: 'escape' })
    }
    const conflicting: Plugin = () => (_tree, vFile) => {
      emitPageArtifactFile(vFile, { path: 'examples/Demo.svelte', content: 'first' })
      emitPageArtifactFile(vFile, { path: 'examples/Demo.svelte', content: 'second' })
    }

    await expect(compilePageArtifactModule({ filename, source: '# Generated', remarkPlugins: [unsafe] })).rejects.toThrow(/unsafe/i)
    await expect(compilePageArtifactModule({ filename, source: '# Generated', remarkPlugins: [conflicting] })).rejects.toThrow(/conflicting content/i)
    for (const path of ['examples/Demo.svelte?raw', 'examples/Demo.svelte#fragment']) {
      const reserved: Plugin = () => (_tree, vFile) => {
        emitPageArtifactFile(vFile, { path, content: 'reserved' })
      }
      await expect(compilePageArtifactModule({ filename, source: '# Generated', remarkPlugins: [reserved] })).rejects.toThrow(/unsafe/i)
    }
  })

  it('keeps artifact and ordinary markdown compilation isolated in the development cache', async () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const emitter: Plugin = () => (tree, vFile) => {
      const generated = emitPageArtifactFile(vFile, {
        path: 'examples/Demo.svelte',
        content: '<h1>Demo</h1>',
      })
      tree.children.push({ type: 'html', value: `<p>${generated ?? 'ordinary'}</p>` } as never)
    }
    const compilePair = async (name: string, artifactFirst: boolean) => {
      const root = mkdtempSync(join(tmpdir(), `sveltepress-page-cache-${name}-`))
      const filename = join(root, 'src/routes/guide/+page.md')
      const source = `# ${name}`
      mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
      writeFileSync(filename, source)
      const compileArtifact = () => compilePageArtifactModule({ filename, source, remarkPlugins: [emitter] })
      const compileOrdinary = () => wrapPage({ id: filename, mdOrSvelteCode: source, remarkPlugins: [emitter] })
      if (artifactFirst) {
        const artifact = await compileArtifact()
        const ordinary = await compileOrdinary()
        return { artifact, ordinary }
      }
      const ordinary = await compileOrdinary()
      const artifact = await compileArtifact()
      return { artifact, ordinary }
    }

    try {
      for (const artifactFirst of [false, true]) {
        const { artifact, ordinary } = await compilePair(artifactFirst ? 'artifact-first' : 'ordinary-first', artifactFirst)
        expect(artifact.files['generated/examples/Demo.svelte']).toBe('<h1>Demo</h1>')
        expect(String(artifact.files['client.js'])).toContain('page-artifact-generated/examples/Demo.svelte')
        expect(ordinary.wrappedCode).toContain('<p>ordinary</p>')
        expect(ordinary.wrappedCode).not.toContain('page-artifact-generated')
      }
    }
    finally {
      if (previousNodeEnv === undefined)
        delete process.env.NODE_ENV
      else
        process.env.NODE_ENV = previousNodeEnv
    }
  })
})
