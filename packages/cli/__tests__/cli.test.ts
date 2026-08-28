import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runCli } from '../src/index'

function site() {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-cli-'))
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

describe('sveltepress versions CLI', () => {
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
})
