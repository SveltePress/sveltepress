import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { PAGE_ARTIFACT_MODULE_SCHEMA, readVersionArtifactManifest } from '@sveltepress/vite/versioning'
import { describe, expect, it } from 'vitest'
import { runCli } from '../src/index'

function site() {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-cli-'))
  writeFileSync(join(root, 'package.json'), '{"scripts":{"build":"vite build"}}\n')
  mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
  writeFileSync(join(root, 'src/routes/+layout.svelte'), '<slot />')
  writeFileSync(join(root, 'src/routes/+page.md'), '# Home')
  writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Guide')
  writeFileSync(join(root, 'src/routes/guide/Counter.svelte'), '<button>0</button>')
  return root
}

function updateManifest(root: string, update: (manifest: any) => void) {
  const path = join(root, 'sveltepress.versions.json')
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  update(manifest)
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`)
}

async function invoke(root: string, args: string[]) {
  const stdout: string[] = []
  const stderr: string[] = []
  const code = await runCli(args, {
    cwd: root,
    stdout: value => stdout.push(value),
    stderr: value => stderr.push(value),
  })
  return { code, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

async function invokeWithSidebar(root: string, args: string[], sidebar: unknown) {
  const stdout: string[] = []
  const stderr: string[] = []
  const code = await runCli(args, {
    cwd: root,
    stdout: value => stdout.push(value),
    stderr: value => stderr.push(value),
    resolveSidebar: async () => sidebar,
  })
  return { code, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

function incrementalIO(root: string) {
  const stdout: string[] = []
  const stderr: string[] = []
  const compiled: string[] = []
  let builds = 0
  let historicalRoutesMounted = false
  let compilerVersion = 1
  return {
    stdout,
    stderr,
    compiled,
    get builds() { return builds },
    get historicalRoutesMounted() { return historicalRoutesMounted },
    setCompilerVersion(value: number) { compilerVersion = value },
    io: {
      cwd: root,
      stdout: (value: string) => stdout.push(value),
      stderr: (value: string) => stderr.push(value),
      compilePage: async (filename: string, source: string, options: { routesDirectory: string, siteRoot: string }) => {
        const segments = relative(options.routesDirectory, dirname(filename)).split(sep).filter(Boolean)
        const route = segments.length ? `/${segments.join('/')}/` : '/'
        compiled.push(route)
        return {
          files: {
            'client.js': `export default ${JSON.stringify(`client:${compilerVersion}:${source}`)}`,
            'server.js': `export default ${JSON.stringify(`server:${compilerVersion}:${source}`)}`,
            'metadata.json': JSON.stringify({ route, fm: { title: route } }),
          },
        }
      },
      runBuild: async () => {
        builds += 1
        historicalRoutesMounted = existsSync(join(root, 'src/routes/v'))
      },
    },
  }
}

describe('sveltepress versions CLI', () => {
  it('migrates once and stores only two new page blobs for a two-page release', async () => {
    const root = site()
    for (let index = 0; index < 28; index += 1) {
      mkdirSync(join(root, `src/routes/page-${index}`), { recursive: true })
      writeFileSync(join(root, `src/routes/page-${index}/+page.md`), `# Page ${index}`)
    }
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)
    expect(harness.compiled).toHaveLength(30)

    harness.compiled.length = 0
    const firstCreate = await runCli(['versions', 'create', 'v9'], harness.io)
    expect({ code: firstCreate, stderr: harness.stderr.join('\n') }).toEqual({ code: 0, stderr: '' })
    expect(JSON.parse(readFileSync(join(root, 'version-deltas/v8/delta.json'), 'utf8')).pages).toHaveLength(30)
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Guide changed')
    writeFileSync(join(root, 'src/routes/page-7/+page.md'), '# Page 7 changed')
    writeFileSync(join(root, 'package.json'), '{"scripts":{"build":"sveltepress versions build"}}\n')

    harness.stdout.length = 0
    expect(await runCli(['versions', 'plan'], harness.io)).toBe(0)
    const plan = JSON.parse(harness.stdout.at(-1)!)
    expect(plan).toMatchObject({ compiledPages: 2, reusedPages: 28 })
    expect(plan.compiledRoutes).toEqual(['/guide/', '/page-7/'])

    harness.stdout.length = 0
    expect(await runCli(['versions', 'build'], harness.io)).toBe(0)
    expect(harness.compiled).toEqual(['/guide/', '/page-7/'])
    expect(harness.builds).toBe(1)
    expect(harness.historicalRoutesMounted).toBe(true)
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)

    expect(await runCli(['versions', 'create', 'v10'], harness.io)).toBe(0)
    expect(JSON.parse(readFileSync(join(root, 'version-deltas/v9/delta.json'), 'utf8')).pages.map((page: any) => page.route)).toEqual(['/guide/', '/page-7/'])
    const store = join(root, '.sveltepress/version-artifacts')
    const v8 = readVersionArtifactManifest(store, 'docs-test', 'v8')!
    const v9 = readVersionArtifactManifest(store, 'docs-test', 'v9')!
    const changedHashes = Object.keys(v9.pages).filter(route => v9.pages[route].artifactHash !== v8.pages[route].artifactHash)
    expect(changedHashes).toEqual(['/guide/', '/page-7/'])
    expect(existsSync(join(root, 'src/routes/v/v9'))).toBe(false)
  })

  it('rejects a stale incremental draft after compiler inputs change', async () => {
    const root = site()
    writeFileSync(join(root, 'vite.config.ts'), 'export default { marker: 1 }\n')
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    writeFileSync(join(root, 'vite.config.ts'), 'export default { marker: 2 }\n')

    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(1)
    expect(harness.stderr.join('\n')).toMatch(/fingerprint.*versions build/i)
    expect(existsSync(join(root, 'version-deltas/v8'))).toBe(false)
    expect(readVersionArtifactManifest(join(root, '.sveltepress/version-artifacts'), 'docs-test', 'v8')).toBeNull()
  })

  it('keeps incremental publication atomic when sidebar resolution fails', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    harness.io.resolveSidebar = async () => {
      throw new Error('Cannot resolve incremental sidebar')
    }

    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(1)
    expect(harness.stderr.join('\n')).toContain('Cannot resolve incremental sidebar')
    expect(existsSync(join(root, 'version-deltas/v8'))).toBe(false)
    expect(readVersionArtifactManifest(join(root, '.sveltepress/version-artifacts'), 'docs-test', 'v8')).toBeNull()
    expect(JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8')).current.id).toBe('v8')
  })

  it('validates committed incremental sources without a local artifact cache and detects drift', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    const create = await runCli(['versions', 'create', 'v9'], harness.io)
    expect({ code: create, stderr: harness.stderr.join('\n') }).toEqual({ code: 0, stderr: '' })
    rmSync(join(root, '.sveltepress/version-artifacts'), { recursive: true, force: true })
    expect(await runCli(['versions', 'validate'], harness.io)).toBe(0)

    writeFileSync(join(root, 'version-deltas/v8/files/src/routes/guide/+page.md'), '# Tampered guide')
    harness.stderr.length = 0
    expect(await runCli(['versions', 'validate'], harness.io)).toBe(1)
    expect(harness.stderr.join('\n')).toMatch(/source delta.*drift/i)
  })

  it('rebuilds incompatible historical cache entries from committed deltas', async () => {
    const root = site()
    writeFileSync(join(root, 'vite.config.ts'), 'export default { marker: 1 }\n')
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(0)
    const store = join(root, '.sveltepress/version-artifacts')
    const before = readVersionArtifactManifest(store, 'docs-test', 'v8')!

    writeFileSync(join(root, 'vite.config.ts'), 'export default { marker: 2 }\n')
    harness.setCompilerVersion(2)
    harness.compiled.length = 0
    expect(await runCli(['versions', 'build'], harness.io)).toBe(0)

    const after = readVersionArtifactManifest(store, 'docs-test', 'v8')!
    expect(after.fingerprints.pageCompiler).not.toBe(before.fingerprints.pageCompiler)
    expect(harness.compiled).toEqual(['/', '/guide/'])
    expect(await runCli(['versions', 'validate'], harness.io)).toBe(0)
  })

  it('rebuilds page-module-v2 caches with self-contained generated artifacts', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(0)
    const store = join(root, '.sveltepress/version-artifacts')
    const manifestPath = join(store, 'manifests/docs-test/v8.json')
    const legacy = JSON.parse(readFileSync(manifestPath, 'utf8'))
    legacy.fingerprints.artifactSchema = 'page-module-v2'
    writeFileSync(manifestPath, `${JSON.stringify(legacy, null, 2)}\n`)

    harness.compiled.length = 0
    expect(await runCli(['versions', 'build'], harness.io)).toBe(0)

    expect(harness.compiled).toEqual(['/', '/guide/'])
    expect(readVersionArtifactManifest(store, 'docs-test', 'v8')?.fingerprints.artifactSchema).toBe(PAGE_ARTIFACT_MODULE_SCHEMA)
    expect(await runCli(['versions', 'validate'], harness.io)).toBe(0)
  })

  it('reconstructs corrupt historical cache manifests and blobs from committed deltas', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(0)
    const store = join(root, '.sveltepress/version-artifacts')
    const artifact = readVersionArtifactManifest(store, 'docs-test', 'v8')!
    const homeBlob = artifact.pages['/'].artifactHash
    writeFileSync(join(store, 'blobs', homeBlob, 'client.js'), 'corrupt')
    writeFileSync(join(store, 'manifests/docs-test/v8.json'), '{ corrupt')

    harness.compiled.length = 0
    expect(await runCli(['versions', 'build'], harness.io)).toBe(0)

    expect(harness.compiled).toEqual(['/', '/guide/'])
    expect(readVersionArtifactManifest(store, 'docs-test', 'v8')).not.toBeNull()
    expect(readFileSync(join(store, 'blobs', homeBlob, 'client.js'), 'utf8')).not.toBe('corrupt')
  })

  it('detects drift in incremental frozen metadata', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const harness = incrementalIO(root)
    expect(await runCli(['versions', 'migrate', '--site-id', 'docs-test'], harness.io)).toBe(0)
    expect(await runCli(['versions', 'create', 'v9'], harness.io)).toBe(0)
    updateManifest(root, (manifest) => {
      manifest.versions[0].sidebar = { '/': [{ title: 'Tampered', to: '/' }] }
    })

    harness.stderr.length = 0
    expect(await runCli(['versions', 'validate'], harness.io)).toBe(1)
    expect(harness.stderr.join('\n')).toMatch(/frozen metadata.*drift/i)
  })

  it('initializes, lists, and validates a site', async () => {
    const root = site()
    expect(await invoke(root, ['versions', 'init', '--current', 'v8', '--label', '8.x'])).toMatchObject({ code: 0 })
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8'))
    expect(manifest).toMatchObject({ basePath: '/v', current: { id: 'v8', label: '8.x' }, versions: [] })
    expect((await invoke(root, ['versions', 'list'])).stdout).toContain('v8')
    expect(await invoke(root, ['versions', 'validate'])).toMatchObject({ code: 0 })
  })

  it('rejects an occupied base route without writing a manifest', async () => {
    const root = site()
    mkdirSync(join(root, 'src/routes/v'))
    const result = await invoke(root, ['versions', 'init', '--current', 'v8'])
    expect(result.code).toBe(1)
    expect(result.stderr).toMatch(/already exists/)
    expect(existsSync(join(root, 'sveltepress.versions.json'))).toBe(false)
  })

  it('rejects route groups and dynamic routes that occupy the version prefix', async () => {
    const grouped = site()
    mkdirSync(join(grouped, 'src/routes/(docs)/v'), { recursive: true })
    writeFileSync(join(grouped, 'src/routes/(docs)/v/+page.svelte'), '<h1>Existing /v</h1>')
    const groupedResult = await invoke(grouped, ['versions', 'init', '--current', 'v8'])
    expect(groupedResult).toMatchObject({ code: 1 })
    expect(groupedResult.stderr).toContain('(docs)/v/+page.svelte')

    const dynamic = site()
    mkdirSync(join(dynamic, 'src/routes/[section]'), { recursive: true })
    writeFileSync(join(dynamic, 'src/routes/[section]/+page.svelte'), '<h1>Dynamic</h1>')
    const dynamicResult = await invoke(dynamic, ['versions', 'init', '--current', 'v8'])
    expect(dynamicResult).toMatchObject({ code: 1 })
    expect(dynamicResult.stderr).toContain('[section]/+page.svelte')
  })

  it('creates a complete historical route snapshot and advances current', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const result = await invoke(root, ['versions', 'create', 'v9'])
    expect(result.code).toBe(0)
    expect(readFileSync(join(root, 'src/routes/v/v8/guide/Counter.svelte'), 'utf8')).toContain('button')
    expect(existsSync(join(root, 'src/routes/v/v8/+layout.svelte'))).toBe(false)
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8'))
    expect(manifest.current.id).toBe('v9')
    expect(manifest.versions[0]).toMatchObject({ id: 'v8', status: 'stable' })
    const metadata = JSON.parse(readFileSync(join(root, 'src/routes/v/v8/.sveltepress-version.json'), 'utf8'))
    expect(metadata.changes).toEqual({
      versionId: 'v8',
      baselineVersionId: null,
      newPages: [],
      updatedPages: [],
    })
  })

  it('freezes new pages and marked updates against the previous snapshot', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    await invoke(root, ['versions', 'create', 'v9'])
    mkdirSync(join(root, 'src/routes/reference/new-api'), { recursive: true })
    writeFileSync(join(root, 'src/routes/reference/new-api/+page.md'), [
      '---',
      'title: New API',
      'versionChanges:',
      '  summary: A focused overview',
      '---',
      '# New API',
    ].join('\n'))
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      '---',
      'title: Guide',
      '---',
      ':::since[Fast refresh]{version="v9" id="fast-refresh"}',
      'No restart is needed.',
      ':::',
    ].join('\n'))

    expect(await invoke(root, ['versions', 'create', 'v10'])).toMatchObject({ code: 0 })
    const metadata = JSON.parse(readFileSync(join(root, 'src/routes/v/v9/.sveltepress-version.json'), 'utf8'))
    expect(metadata.changes).toEqual({
      versionId: 'v9',
      baselineVersionId: 'v8',
      newPages: [{ route: '/reference/new-api/', title: 'New API', summary: 'A focused overview', sections: [] }],
      updatedPages: [{
        route: '/guide/',
        title: 'Guide',
        sections: [{ id: 'fast-refresh', title: 'Fast refresh', introducedIn: 'v9' }],
      }],
    })
  })

  it('leaves the manifest and snapshots untouched when change extraction fails', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    writeFileSync(join(root, 'src/routes/guide/+page.md'), ':::since[Broken]{version="unknown" id="broken"}\n:::')
    const before = readFileSync(join(root, 'sveltepress.versions.json'), 'utf8')

    const result = await invoke(root, ['versions', 'create', 'v9'])
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toContain('unknown version')
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)
    expect(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8')).toBe(before)
  })

  it('does not overwrite an existing historical id', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    await invoke(root, ['versions', 'create', 'v9'])
    const result = await invoke(root, ['versions', 'create', 'v8'])
    expect(result.code).toBe(1)
    expect(result.stderr).toMatch(/already exists/)
  })

  it('rejects a dirty git worktree unless explicitly allowed', async () => {
    const root = site()
    execFileSync('git', ['init', '-q'], { cwd: root })
    execFileSync('git', ['add', '.'], { cwd: root })
    execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'initial'], { cwd: root })
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    expect((await invoke(root, ['versions', 'create', 'v9'])).stderr).toMatch(/dirty/)
    expect(await invoke(root, ['versions', 'create', 'v9', '--allow-dirty'])).toMatchObject({ code: 0 })
  })

  it('enforces include, exclude, and shared dependency boundaries', async () => {
    const root = site()
    mkdirSync(join(root, 'src/routes/admin'), { recursive: true })
    writeFileSync(join(root, 'src/routes/admin/+page.md'), '# Private')
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '<script>\nimport Widget from \'$lib/Widget.svelte\'\n</script>\n# Guide')
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    updateManifest(root, manifest => manifest.content.exclude.push('admin/**'))

    const blocked = await invoke(root, ['versions', 'create', 'v9'])
    expect(blocked.code).toBe(1)
    expect(blocked.stderr).toContain('$lib/Widget.svelte')
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)

    updateManifest(root, manifest => manifest.content.shared.push('$lib/**'))
    expect(await invoke(root, ['versions', 'create', 'v9'])).toMatchObject({ code: 0 })
    expect(existsSync(join(root, 'src/routes/v/v8/admin'))).toBe(false)
    const metadata = JSON.parse(readFileSync(join(root, 'src/routes/v/v8/.sveltepress-version.json'), 'utf8'))
    expect(metadata.sharedDependencies).toContain('$lib/Widget.svelte')
  })

  it('ignores dependency-like examples in markdown fences', async () => {
    const root = site()
    writeFileSync(join(root, 'src/routes/guide/+page.md'), [
      '# Guide',
      '',
      '```ts',
      'import Example from \'../outside/Example.svelte\'',
      'const source = `@code(/path/to/file.ts)`',
      '```',
      '',
      '~~~svelte',
      'import Widget from \'$lib/Example.svelte\'',
      '![example](/example.png)',
      '~~~',
      '',
      'Inline examples: `@code(/path/to/file.ts)` and `![image](/example.png)`.',
    ].join('\n'))
    await invoke(root, ['versions', 'init', '--current', '1.0'])
    expect(await invoke(root, ['versions', 'create', '2.0'])).toMatchObject({ code: 0 })
    expect(existsSync(join(root, 'src/routes/v/1.0/guide/+page.md'))).toBe(true)
  })

  it('freezes resolved Default Theme sidebar metadata', async () => {
    const root = site()
    const sidebar = {
      '/guide/': [{ title: 'Guide', items: [{ title: 'Start', to: '/guide/' }] }],
    }
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    await invokeWithSidebar(root, ['versions', 'create', 'v9'], sidebar)
    const metadata = JSON.parse(readFileSync(join(root, 'src/routes/v/v8/.sveltepress-version.json'), 'utf8'))
    expect(metadata.sidebar['/guide/'][0].title).toBe('Guide')
  })

  it('leaves no partial snapshot or manifest change when sidebar resolution fails', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(['versions', 'create', 'v9'], {
      cwd: root,
      stdout: value => stdout.push(value),
      stderr: value => stderr.push(value),
      resolveSidebar: async () => { throw new Error('Cannot resolve theme sidebar') },
    })
    const result = { code, stderr: stderr.join('\n') }
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toMatch(/Cannot resolve theme sidebar/)
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)
    expect(JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8')).current.id).toBe('v8')
  })

  it('rolls back a committed snapshot when the manifest commit fails', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const stdout: string[] = []
    const stderr: string[] = []
    const code = await runCli(['versions', 'create', 'v9'], {
      cwd: root,
      stdout: value => stdout.push(value),
      stderr: value => stderr.push(value),
      resolveSidebar: async () => ({}),
      writeManifest: async () => { throw new Error('injected manifest failure') },
    })
    expect(code).toBe(1)
    expect(stderr.join('\n')).toContain('injected manifest failure')
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)
    expect(JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8')).current.id).toBe('v8')
  })

  it('rejects side-effect imports, re-exports, require calls, and live asset references', async () => {
    const root = site()
    writeFileSync(join(root, 'src/routes/guide/Counter.svelte'), [
      '<script>',
      'import \'../../outside.css\'',
      'export { helper } from \'../../helpers.ts\'',
      'const module = require(\'$lib/module\')',
      '</script>',
      '<img src="/logo.png" alt="Logo">',
    ].join('\n'))
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const result = await invoke(root, ['versions', 'create', 'v9'])
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('src/outside.css')
    expect(result.stderr).toContain('src/helpers.ts')
    expect(result.stderr).toContain('$lib/module')
    expect(result.stderr).toContain('static/logo.png')
  })

  it('rejects live root assets referenced from route-local stylesheets', async () => {
    const root = site()
    writeFileSync(join(root, 'src/routes/guide/theme.scss'), '.hero { background: url(\'/live-asset.png\') }')
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const result = await invoke(root, ['versions', 'create', 'v9'])
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toContain('static/live-asset.png')
  })

  it('rejects symbolic links before creating a snapshot', async () => {
    const root = site()
    writeFileSync(join(root, 'shared.md'), '# Shared')
    symlinkSync(join(root, 'shared.md'), join(root, 'src/routes/guide/shared.md'))
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    const result = await invoke(root, ['versions', 'create', 'v9'])
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toMatch(/symbolic links/)
    expect(existsSync(join(root, 'src/routes/v'))).toBe(false)
  })

  it('reports newly unsafe current dependencies during validation', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '<script>\nimport Widget from \'$lib/Widget.svelte\'\n</script>')

    const result = await invoke(root, ['versions', 'validate'])
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toContain('$lib/Widget.svelte')
  })

  it('reports drift between frozen changes and historical snapshot content', async () => {
    const root = site()
    await invoke(root, ['versions', 'init', '--current', 'v8'])
    await invoke(root, ['versions', 'create', 'v9'])
    const metadataPath = join(root, 'src/routes/v/v8/.sveltepress-version.json')
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
    metadata.changes.newPages.push({ route: '/missing/', title: 'Missing', sections: [] })
    writeFileSync(metadataPath, JSON.stringify(metadata))

    const result = await invoke(root, ['versions', 'validate'])
    expect(result).toMatchObject({ code: 1 })
    expect(result.stderr).toMatch(/frozen changes.*snapshot content.*drift/i)
  })
})
