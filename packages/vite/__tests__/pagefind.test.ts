import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { indexSiteWithPagefind, syncHistoricalPagefind } from '../src/pagefind'

describe('pagefind indexing in vite', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'svp-pagefind-test-'))
  })

  afterEach(() => {
    if (existsSync(tempDir))
      rmSync(tempDir, { recursive: true, force: true })
  })

  it('fails gracefully when site directory does not exist', async () => {
    const result = await indexSiteWithPagefind(join(tempDir, 'non-existent'))
    expect(result.success).toBe(false)
    expect(result.reason).toContain('Target site directory does not exist')
  })

  it('skips indexing when disabled', async () => {
    const result = await indexSiteWithPagefind(tempDir, { enabled: false })
    expect(result.success).toBe(false)
    expect(result.reason).toContain('disabled')
  })

  it('indexes mock html files and emits pagefind search assets', async () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><title>SveltePress Guide</title></head>
<body>
  <nav data-pagefind-ignore>Navigation</nav>
  <main data-pagefind-body>
    <h1>Getting Started</h1>
    <p>SveltePress is a documentation generator built on top of SvelteKit and Vite.</p>
  </main>
</body>
</html>`
    writeFileSync(join(tempDir, 'index.html'), html, 'utf-8')

    const result = await indexSiteWithPagefind(tempDir)
    expect(result.success).toBe(true)
    expect(result.pageCount).toBe(1)

    const pagefindDir = join(tempDir, 'pagefind')
    expect(existsSync(pagefindDir)).toBe(true)
    expect(existsSync(join(pagefindDir, 'pagefind.js'))).toBe(true)
    expect(existsSync(join(pagefindDir, 'pagefind-entry.json'))).toBe(true)
  })

  it('indexes multi-locale sites detecting html lang attributes', async () => {
    mkdirSync(join(tempDir, 'zh'), { recursive: true })
    mkdirSync(join(tempDir, 'bn'), { recursive: true })

    const enHtml = `<!DOCTYPE html>
<html lang="en">
<head><title>Home</title></head>
<body><main data-pagefind-body><h1>Welcome</h1><p>Welcome to SveltePress.</p></main></body>
</html>`

    const zhHtml = `<!DOCTYPE html>
<html lang="zh">
<head><title>首页</title></head>
<body><main data-pagefind-body><h1>欢迎</h1><p>欢迎使用 SveltePress 中文文档。</p></main></body>
</html>`

    const bnHtml = `<!DOCTYPE html>
<html lang="bn">
<head><title>হোম</title></head>
<body><main data-pagefind-body><h1>স্বাগতম</h1><p>SveltePress ডকুমেন্টেশনে স্বাগতম।</p></main></body>
</html>`

    writeFileSync(join(tempDir, 'index.html'), enHtml, 'utf-8')
    writeFileSync(join(tempDir, 'zh', 'index.html'), zhHtml, 'utf-8')
    writeFileSync(join(tempDir, 'bn', 'index.html'), bnHtml, 'utf-8')

    const result = await indexSiteWithPagefind(tempDir)
    expect(result.success).toBe(true)
    expect(result.pageCount).toBe(3)

    const pagefindDir = join(tempDir, 'pagefind')
    expect(existsSync(join(pagefindDir, 'pagefind.js'))).toBe(true)

    // Verify entry json records language metadata
    const entryJson = JSON.parse(readFileSync(join(pagefindDir, 'pagefind-entry.json'), 'utf-8'))
    expect(entryJson.languages).toBeDefined()
    expect(Object.keys(entryJson.languages)).toContain('en')
    expect(Object.keys(entryJson.languages)).toContain('zh')
  })

  it('supports custom output path', async () => {
    writeFileSync(join(tempDir, 'index.html'), '<!DOCTYPE html><html lang="en"><body><main data-pagefind-body><h1>Test</h1></main></body></html>')
    const customOut = join(tempDir, 'custom-search')

    const result = await indexSiteWithPagefind(tempDir, { outputPath: customOut })
    expect(result.success).toBe(true)
    expect(result.outputPath).toBe(customOut)
    expect(existsSync(join(customOut, 'pagefind.js'))).toBe(true)
  })

  it('syncs and persists historical version pagefind search assets', async () => {
    const siteRoot = join(tempDir, 'site')
    const outputDir = join(tempDir, 'dist')
    mkdirSync(siteRoot, { recursive: true })
    mkdirSync(join(outputDir, 'v', '2026-08-27'), { recursive: true })

    const manifest = {
      basePath: '/v',
      current: { id: '2026-08-31' },
      versions: [{ id: '2026-08-27' }],
    }
    writeFileSync(join(siteRoot, 'sveltepress.versions.json'), JSON.stringify(manifest), 'utf-8')

    const historicalHtml = '<!DOCTYPE html><html lang="en"><head><title>Old</title></head><body><div class="content"><h1>Historical Guide</h1><p>Historical documentation content.</p></div></body></html>'
    writeFileSync(join(outputDir, 'v', '2026-08-27', 'index.html'), historicalHtml, 'utf-8')

    // First run: builds and freezes into version-deltas
    const firstRun = await syncHistoricalPagefind(siteRoot, outputDir)
    expect(firstRun).toHaveLength(1)
    expect(firstRun[0].versionId).toBe('2026-08-27')
    expect(firstRun[0].cached).toBe(false)
    expect(firstRun[0].success).toBe(true)

    const distPagefind = join(outputDir, 'v', '2026-08-27', 'pagefind')
    const frozenPagefind = join(siteRoot, 'version-deltas', '2026-08-27', 'pagefind')
    expect(existsSync(join(distPagefind, 'pagefind.js'))).toBe(true)
    expect(existsSync(join(frozenPagefind, 'pagefind.js'))).toBe(true)

    // Remove dist output to simulate a clean build
    rmSync(distPagefind, { recursive: true, force: true })
    expect(existsSync(distPagefind)).toBe(false)

    // Second run: copies directly from frozen storage without re-indexing
    const secondRun = await syncHistoricalPagefind(siteRoot, outputDir)
    expect(secondRun).toHaveLength(1)
    expect(secondRun[0].versionId).toBe('2026-08-27')
    expect(secondRun[0].cached).toBe(true)
    expect(secondRun[0].success).toBe(true)
    expect(existsSync(join(distPagefind, 'pagefind.js'))).toBe(true)
  })
})
