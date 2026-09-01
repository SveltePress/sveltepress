import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
})
