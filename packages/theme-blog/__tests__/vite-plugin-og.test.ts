import type { Plugin, ResolvedConfig } from 'vite'
import type { BlogThemeOptions } from '../src/types.js'
import { Buffer } from 'node:buffer'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let root: string

beforeEach(async () => {
  vi.resetModules()
  root = await mkdtemp(join(tmpdir(), 'sveltepress-blog-og-'))
  await mkdir(join(root, 'src/posts'), { recursive: true })
  await mkdir(join(root, 'static'), { recursive: true })
  await writeFile(join(root, 'src/posts/hello.md'), `---
title: Hello blog
date: '2026-09-15'
tags: [svelte]
category: Development
---
A published post.
`)
  await writeFile(join(root, 'src/posts/draft.md'), `---
title: Draft post
date: '2026-09-15'
draft: true
---
An unpublished post.
`)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(async () => {
  vi.doUnmock('../src/og-image.js')
  vi.restoreAllMocks()
  await rm(root, { recursive: true, force: true })
})

async function startBlog(ogImage?: BlogThemeOptions['ogImage'], command: 'serve' | 'build' = 'serve') {
  const { blogTheme } = await import('../src/index.js')
  const theme = blogTheme({ title: 'Test blog', base: 'https://example.com', ogImage })
  const plugins = typeof theme.vitePlugins === 'function'
    ? await theme.vitePlugins({ name: 'test-core' })
    : theme.vitePlugins
  const plugin = plugins[0] as Plugin
  const configResolved = plugin.configResolved as (config: ResolvedConfig) => void
  const buildStart = plugin.buildStart as () => Promise<void>
  configResolved({ root, base: '/', command } as ResolvedConfig)
  await buildStart()
  return plugin
}

function ogWarnings() {
  return vi.mocked(console.warn).mock.calls.filter(([message]) => String(message).includes('OG image'))
}

async function expectBlogContent() {
  const post = JSON.parse(await readFile(join(root, '.sveltepress/posts/hello.json'), 'utf-8'))
  expect(post.title).toBe('Hello blog')
  expect(post.contentHtml).toContain('A published post.')
  const rss = await readFile(join(root, 'static/rss.xml'), 'utf-8')
  expect(rss).toContain('Hello blog')
  expect(rss).not.toContain('Draft post')
}

describe('blog theme OG renderer loading', () => {
  it('does not import the renderer when OG images are disabled', async () => {
    const loadRenderer = vi.fn(() => {
      throw Object.assign(new Error('Cannot load native addon because loading addons is disabled.'), {
        code: 'ERR_DLOPEN_DISABLED',
      })
    })
    vi.doMock('../src/og-image.js', loadRenderer)

    await startBlog({ enabled: false })

    expect(loadRenderer).not.toHaveBeenCalled()
    expect(await readdir(join(root, 'static'))).not.toContain('og')
    expect(ogWarnings()).toEqual([])
    await expectBlogContent()
  })

  it.each(['serve', 'build'] as const)('keeps %s working when native addons are disabled', async (command) => {
    const loadRenderer = vi.fn(() => {
      throw Object.assign(new Error('Cannot load native addon because loading addons is disabled.'), {
        code: 'ERR_DLOPEN_DISABLED',
      })
    })
    vi.doMock('../src/og-image.js', loadRenderer)
    await mkdir(join(root, 'static/og'))
    await writeFile(join(root, 'static/og/existing.png'), 'existing image')

    const plugin = await startBlog(undefined, command)

    expect(loadRenderer).toHaveBeenCalledTimes(1)
    expect(ogWarnings()).toHaveLength(1)
    expect(ogWarnings()[0][0]).toContain('OG image generation unavailable')
    expect(await readFile(join(root, 'static/og/existing.png'), 'utf-8')).toBe('existing image')
    const load = plugin.load as (id: string) => string
    expect(load('\0virtual:sveltepress/blog-posts-meta')).toContain('Hello blog')
    await expectBlogContent()
  })

  it('still generates PNGs for published posts and home and removes stale images', async () => {
    await mkdir(join(root, 'static/og'))
    await writeFile(join(root, 'static/og/stale.png'), 'stale image')

    await startBlog()

    expect(await readdir(join(root, 'static/og'))).toEqual(['__home.png', 'hello.png'])
    for (const name of ['__home.png', 'hello.png']) {
      const png = await readFile(join(root, 'static/og', name))
      expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
    }
    expect(ogWarnings()).toEqual([])
    await expectBlogContent()
  }, 20000)
})
