import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runCli } from '../src/index'

function localeSite() {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-cli-locale-'))
  writeFileSync(join(root, 'package.json'), '{"scripts":{"build":"vite build"}}\n')
  mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
  mkdirSync(join(root, 'src/routes/zh/guide'), { recursive: true })
  writeFileSync(join(root, 'src/routes/+layout.svelte'), '<slot />')
  writeFileSync(join(root, 'src/routes/+page.md'), '# Home')
  writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Guide')
  writeFileSync(join(root, 'src/routes/zh/+page.md'), '# 首页')
  writeFileSync(join(root, 'src/routes/zh/guide/+page.md'), '# 指南')
  writeFileSync(join(root, 'src/routes/zh/guide/Counter.svelte'), '<button>0</button>')
  return root
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

describe('locale-selected versions commands', () => {
  it('initializes a locale-scoped manifest with a composed base path', async () => {
    const root = localeSite()
    const result = await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])
    expect(result.code).toBe(0)
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.zh.json'), 'utf8'))
    expect(manifest).toMatchObject({ basePath: '/zh/v', current: { id: '2026-08-28', label: '2026-08-28' }, versions: [] })
    expect(existsSync(join(root, 'sveltepress.versions.json'))).toBe(false)
    expect((await invoke(root, ['versions', 'list', '--locale', 'zh'])).stdout).toContain('2026-08-28')
    expect(await invoke(root, ['versions', 'validate', '--locale', 'zh'])).toMatchObject({ code: 0 })
  })

  it('keeps the default manifest independent of the locale manifest', async () => {
    const root = localeSite()
    expect(await invoke(root, ['versions', 'init', '--current', 'v8'])).toMatchObject({ code: 0 })
    expect(await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])).toMatchObject({ code: 0 })
    const defaultManifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8'))
    const zhManifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.zh.json'), 'utf8'))
    expect(defaultManifest.basePath).toBe('/v')
    expect(zhManifest.basePath).toBe('/zh/v')
    expect((await invoke(root, ['versions', 'list'])).stdout).toContain('v8')
    expect((await invoke(root, ['versions', 'list', '--locale', 'zh'])).stdout).toContain('2026-08-28')
  })

  it('creates a locale-scoped snapshot under the composed version route', async () => {
    const root = localeSite()
    await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])
    const result = await invoke(root, ['versions', 'create', '--locale', 'zh', '2026-08-29'])
    expect(result.code).toBe(0)
    expect(readFileSync(join(root, 'src/routes/zh/v/2026-08-28/guide/Counter.svelte'), 'utf8')).toContain('button')
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.zh.json'), 'utf8'))
    expect(manifest.current.id).toBe('2026-08-29')
    expect(manifest.versions[0]).toMatchObject({ id: '2026-08-28', status: 'stable' })
  })

  it('rejects an occupied locale version base without writing a manifest', async () => {
    const root = localeSite()
    mkdirSync(join(root, 'src/routes/zh/v'))
    const result = await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])
    expect(result.code).toBe(1)
    expect(result.stderr).toMatch(/already exists/)
    expect(existsSync(join(root, 'sveltepress.versions.zh.json'))).toBe(false)
  })

  it('default-locale create excludes sibling locale route trees', async () => {
    // English freezes must not capture /zh or /bn trees; those belong to
    // sveltepress.versions.zh.json / .bn.json and their own deltas.
    const root = localeSite()
    expect(await invoke(root, ['versions', 'init', '--current', '2026-08-28'])).toMatchObject({ code: 0 })
    expect(await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])).toMatchObject({ code: 0 })
    // Legacy (non-incremental) create for the default locale should skip zh/.
    expect(await invoke(root, ['versions', 'create', '2026-08-29', '--allow-dirty'])).toMatchObject({ code: 0 })
    const manifest = JSON.parse(readFileSync(join(root, 'sveltepress.versions.json'), 'utf8'))
    const frozen = manifest.versions.find((version: { id: string }) => version.id === '2026-08-28')
    expect(frozen.routes.every((route: string) => !route.startsWith('/zh/'))).toBe(true)
    expect(existsSync(join(root, 'src/routes/v/2026-08-28/zh'))).toBe(false)
    expect(existsSync(join(root, 'src/routes/v/2026-08-28/guide'))).toBe(true)
  })

  it('builds one locale without requiring sibling locale drafts to exist', async () => {
    // A cold cache (or a CI job) has no published drafts for sibling locales
    // yet: `versions build --locale zh` must succeed before `--locale bn` has
    // ever been built, composing only the requested locale's history.
    const root = localeSite()
    expect(await invoke(root, ['versions', 'init', '--locale', 'zh', '--current', '2026-08-28'])).toMatchObject({ code: 0 })
    expect(await invoke(root, ['versions', 'init', '--locale', 'bn', '--current', '2026-08-28'])).toMatchObject({ code: 0 })
    expect(await invoke(root, ['versions', 'create', '--locale', 'zh', '2026-08-27'])).toMatchObject({ code: 0 })
    // Give bn an artifacts config (as a migrated site would have) but never
    // build it, so its draft manifest does not exist.
    const bnManifestPath = join(root, 'sveltepress.versions.bn.json')
    const bnManifest = JSON.parse(readFileSync(bnManifestPath, 'utf8'))
    bnManifest.artifacts = { mode: 'incremental', siteId: 'docs-bn', store: '.sveltepress/version-artifacts', sources: 'version-deltas-bn' }
    writeFileSync(bnManifestPath, JSON.stringify(bnManifest, null, 2))

    const stdout: string[] = []
    const stderr: string[] = []
    const compiled: string[] = []
    let builds = 0
    const io = {
      cwd: root,
      stdout: (value: string) => stdout.push(value),
      stderr: (value: string) => stderr.push(value),
      compilePage: async (filename: string, source: string, options: { routesDirectory: string, siteRoot: string }) => {
        const segments = relative(options.routesDirectory, dirname(filename)).split(sep).filter(Boolean)
        const route = segments.length ? `/${segments.join('/')}/` : '/'
        compiled.push(route)
        return {
          files: {
            'client.js': `export default ${JSON.stringify(`client:${source}`)}`,
            'server.js': `export default ${JSON.stringify(`server:${source}`)}`,
            'metadata.json': JSON.stringify({ route, fm: { title: route } }),
          },
        }
      },
      runBuild: async () => {
        builds += 1
      },
    }
    expect(await runCli(['versions', 'migrate', '--locale', 'zh', '--site-id', 'docs-zh'], io)).toBe(0)
    const code = await runCli(['versions', 'build', '--locale', 'zh'], io)
    expect({ code, stderr: stderr.join('\n') }).toEqual({ code: 0, stderr: '' })
    expect(builds).toBe(1)
    expect(compiled.length).toBeGreaterThan(0)
  })
})
