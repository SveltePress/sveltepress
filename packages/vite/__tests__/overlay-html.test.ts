import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  currentUrl,
  distIndexPath,
  extractPushedHtml,
  historicalUrl,
  overlayHistoricalVersion,
  rewriteHtmlForHistoricalPage,
  rewriteWhatsNewHtml,
} from '../src/versioning/overlay-html'

const currentHome = [
  '<html><head><title>Home</title><link rel="canonical" href="/" /></head>',
  '<body><div class="version-selector"><span>v9</span></div>',
  '<div class="content" data-pagefind-body="true"><h1>Home</h1></div>',
  '<script>kit.start(app, element, { node_ids: [0, 4] });</script>',
  '</body></html>',
].join('')

describe('historical HTML overlay', () => {
  it('rewrites canonical, version label, and strips current-search hooks', () => {
    const html = rewriteHtmlForHistoricalPage(currentHome, {
      currentUrl: '/',
      historicalUrl: '/v/v8/',
      currentVersionId: 'v9',
      historicalVersionId: 'v8',
    })
    expect(html).toContain('<link rel="canonical" href="/v/v8/"')
    expect(html).toContain('<span>v8</span>')
    expect(html).not.toContain('<span>v9</span>')
    expect(html).not.toContain('data-pagefind-body')
    expect(html).toContain('version-lifecycle')
    expect(html).toContain('You are viewing an older version of this site.')
    expect(html).toContain('aria-label="Current version"')
    expect(html).not.toMatch(/kit\.start\(/)
  })

  it('rewrites version labels when the selector has extra class names', () => {
    const html = rewriteHtmlForHistoricalPage(
      '<div class="version-selector svelte-jeed6y"><button><span>v9</span></button></div><link rel="canonical" href="/" />',
      {
        currentUrl: '/',
        historicalUrl: '/v/v8/',
        currentVersionId: 'v9',
        historicalVersionId: 'v8',
      },
    )
    expect(html).toContain('<span>v8</span>')
    expect(html).not.toContain('<span>v9</span>')
  })

  it('composes locale historical URLs and writes overlay files from current dist', () => {
    expect(historicalUrl('/zh/v', 'v8', '/guide/')).toBe('/zh/v/v8/guide/')
    expect(currentUrl('zh', '/guide/')).toBe('/zh/guide/')
    expect(currentUrl('', '/')).toBe('/')

    const root = mkdtempSync(join(tmpdir(), 'sveltepress-overlay-'))
    const distRoot = join(root, 'dist')
    mkdirSync(join(distRoot, 'guide'), { recursive: true })
    writeFileSync(join(distRoot, 'index.html'), currentHome)
    writeFileSync(join(distRoot, 'guide/index.html'), currentHome.replace('href="/"', 'href="/guide/"').replace('<h1>Home</h1>', '<h1>Guide</h1>'))

    const written = overlayHistoricalVersion({
      distRoot,
      localeDir: '',
      basePath: '/v',
      currentVersionId: 'v9',
      historical: {
        schemaVersion: 1,
        siteId: 'docs',
        versionId: 'v8',
        parent: null,
        fingerprints: {
          artifactSchema: 'page-module-v4',
          pageCompiler: 'x',
          shell: 'x',
          index: 'x',
          planner: 'forward-delta-v1',
        },
        pages: {
          '/': { route: '/', inputHash: 'a', files: [], dependencies: [], artifactHash: 'a'.repeat(64) },
          '/guide/': { route: '/guide/', inputHash: 'b', files: [], dependencies: [], artifactHash: 'b'.repeat(64) },
        },
        removedRoutes: [],
        lineage: [],
      },
    })
    expect(written).toBe(2)
    const home = readFileSync(distIndexPath(distRoot, '/v/v8/'), 'utf8')
    const guide = readFileSync(join(distRoot, 'v/v8/guide/index.html'), 'utf8')
    expect(home).toContain('href="/v/v8/"')
    expect(guide).toContain('href="/v/v8/guide/"')
    expect(existsSync(join(distRoot, 'index.html'))).toBe(true)
  })

  it('extracts compiled HTML from artifact server modules', () => {
    const serverJs = [
      'export default function _page($$renderer) {',
      '$$renderer.push(`<section id="pwa-precache-client" data-sveltepress-introduced-in="2026-09-09">New</section>`);',
      'CopyCode($$renderer, {});',
      '$$renderer.push(`<p>More</p>`);',
      '}',
    ].join('\n')
    expect(extractPushedHtml(serverJs)).toBe(
      '<section id="pwa-precache-client" data-sveltepress-introduced-in="2026-09-09">New</section><p>More</p>',
    )
  })

  it('rewrites What’s New cards from a frozen change set', () => {
    const html = [
      '<section class="release-summary" aria-label="2026-09-09"><strong class="release-version">2026-09-09</strong>',
      '<div class="release-stat release-stat--new"><strong>9</strong></div>',
      '<div class="release-stat release-stat--updated"><strong>9</strong></div>',
      '<option value="2026-09-09" selected="">2026-09-09</option><option value="2026-09-03">2026-09-03</option>',
      '</section><div class="change-sections">old</div>',
    ].join('')
    const rewritten = rewriteWhatsNewHtml(html, '/v', '2026-09-03', {
      versionId: '2026-09-03',
      baselineVersionId: '2026-08-31',
      newPages: [{ route: '/guide/i18n/', title: 'Internationalization (i18n)', sections: [] }],
      updatedPages: [{
        route: '/guide/introduction/',
        title: 'Introduction',
        sections: [{ id: 'intro-link-i18n', title: 'Internationalization guide', introducedIn: '2026-09-03' }],
      }],
    })
    expect(rewritten).toContain('aria-label="2026-09-03"')
    expect(rewritten).toContain('option value="2026-09-03" selected=""')
    expect(rewritten).toContain('class="section-link" href="/v/2026-09-03/guide/introduction/#intro-link-i18n"')
    expect(rewritten).toContain('class="change-card-link" href="/v/2026-09-03/guide/i18n/"')
    expect(rewritten).not.toContain('old')
  })
})
