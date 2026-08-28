import type { Plugin } from 'vite'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import sveltepress from '../src/plugin'

const originalCwd = process.cwd()

afterEach(() => process.chdir(originalCwd))

describe('version changes in development', () => {
  it('refreshes valid changes and rejects invalid markers during hot updates', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-version-hmr-'))
    const page = join(root, 'src/routes/guide/+page.md')
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    writeFileSync(page, '---\ntitle: Guide\n---\n# Guide')
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify({
      basePath: '/v',
      current: { id: 'v9', label: '9.x' },
      versions: [{ id: 'v8', label: '8.x', routes: ['/guide/'] }],
      content: { include: ['**'], exclude: [], shared: [] },
    }))

    process.chdir(root)
    const plugin = sveltepress({ versions: {} }) as Plugin
    const virtualModule = {} as never
    const invalidateModule = vi.fn()
    const send = vi.fn()
    const context = {
      file: page,
      read: async () => '',
      modules: [],
      server: {
        moduleGraph: {
          getModuleById: () => virtualModule,
          invalidateModule,
        },
        ws: { send },
      },
    }

    writeFileSync(page, [
      '---',
      'title: Guide',
      '---',
      ':::since[Fast refresh]{version="v9" id="fast-refresh"}',
      'No restart.',
      ':::',
    ].join('\n'))
    await (plugin.handleHotUpdate as (context: unknown) => Promise<void>)(context)
    const source = await (plugin.load as (id: string) => string)('virtual:sveltepress/versions')
    expect(source).toContain('fast-refresh')
    expect(invalidateModule).toHaveBeenCalledWith(virtualModule)
    expect(send).toHaveBeenCalledWith({ type: 'full-reload' })

    writeFileSync(page, ':::since[Broken]{version="missing" id="broken"}\n:::')
    await expect(
      (plugin.handleHotUpdate as (context: unknown) => Promise<void>)(context),
    ).rejects.toThrow(/unknown version/)
  })
})
