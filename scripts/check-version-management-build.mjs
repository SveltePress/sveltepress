import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const official = join(root, 'packages/docs-site/dist')
const historicalId = '2026-08-27'
const historicalRoot = join(official, 'v', historicalId)
const previousId = '2026-08-28'
const previousRoot = join(official, 'v', previousId)
const currentId = '2026-08-31'
const versionIds = [currentId, previousId, historicalId]
const currentChanges = [
  { route: 'guide/default-theme/code-related', id: 'literal-markdown-live-source' },
  { route: 'guide/default-theme/code-related', id: 'multiple-focus-ranges' },
  { route: 'guide/default-theme/headings-and-anchors', id: 'toc-heading-hierarchy' },
  { route: 'guide/default-theme/home-page', id: 'hero-code-localization' },
  { route: 'guide/version-management', id: 'next-version-doc-workflow' },
  { route: 'guide/version-management', id: 'version-scoped-whats-new' },
  { route: 'reference/vite-plugin', id: 'literal-code-preparation' },
]
const currentChangeLinks = currentChanges.map(({ route, id }) => `/${route}/#${id}`)
const currentChangeRoutes = [...new Set(currentChanges.map(({ route }) => `/${route}/`))]
const previousChangeLinks = [`/v/${previousId}/reference/vite-plugin/#version-change-discovery`]
const previousChangeRoutes = [
  `/v/${previousId}/guide/version-management/`,
  `/v/${previousId}/reference/vite-plugin/`,
]
const changedCodeRelatedTocSlugs = {
  '': ['Focus', 'Markdown-live-code'],
  'zh': ['聚焦', 'Markdown-可折叠代码块'],
  'bn': ['ফোকাস', 'Markdown-লাইভ-কোড'],
}

function assert(condition, message) {
  if (!condition)
    throw new Error(message)
}

function read(path) {
  return readFileSync(path, 'utf8')
}

function files(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name))
}

function assertSameStrings(actual, expected, message) {
  const actualSorted = [...actual].sort()
  const expectedSorted = [...expected].sort()
  assert(
    JSON.stringify(actualSorted) === JSON.stringify(expectedSorted),
    `${message}. Expected ${expectedSorted.join(', ')}, received ${actualSorted.join(', ')}`,
  )
}

function linksWithClass(html, className) {
  return [...html.matchAll(new RegExp(`<a class="${className}[^\"]*" href="([^\"]+)"`, 'g'))]
    .map(match => match[1])
}

function assertVersionSelectorLabel(html, versionId, message) {
  const start = html.indexOf('class="version-selector')
  const end = html.indexOf('</div>', start)
  assert(
    start >= 0
    && end > start
    && html.slice(start, end).includes(`>${versionId}</span>`),
    message,
  )
}

function assertVersionChangesSummary(html, versionId, message) {
  const start = html.indexOf('class="release-summary')
  const end = html.indexOf('</section>', start)
  assert(
    start >= 0
    && end > start
    && html.slice(start, end).includes(`aria-label="${versionId}"`),
    message,
  )
}

function versionPickerIds(html) {
  const start = html.indexOf('<select id="version-changes-selector"')
  const end = html.indexOf('</select>', start)
  assert(start >= 0 && end > start, 'What’s New version picker is missing')
  return [...html.slice(start, end).matchAll(/<option value="([^"]+)"/g)]
    .map(match => match[1])
}

function tableOfContentsLink(html, slug, message) {
  const start = html.indexOf(`<a href="#${slug}" class="item`)
  const end = html.indexOf('</a>', start)
  assert(start >= 0 && end > start, message)
  return html.slice(start, end)
}

function assertTableOfContentsBadge(html, slug, expected, message) {
  const link = tableOfContentsLink(html, slug, `${message}: table-of-contents link is missing`)
  assert(
    link.includes('version-navigation-new-badge') === expected,
    message,
  )
}

function assertCurrentDocumentationChanges(site, siteRoot) {
  const localePrefix = site ? `/${site}` : ''
  const localeChangeLinks = currentChangeLinks.map(link => `${localePrefix}${link}`)
  const localeChangeRoutes = currentChangeRoutes.map(route => `${localePrefix}${route}`)
  const localePreviousChangeLinks = previousChangeLinks.map(link => `${localePrefix}${link}`)
  const localePreviousChangeRoutes = previousChangeRoutes.map(route => `${localePrefix}${route}`)
  const whatsNewHtml = read(join(siteRoot, 'whats-new/index.html'))
  const previousWhatsNewPath = join(siteRoot, 'v', previousId, 'whats-new/index.html')
  assert(existsSync(previousWhatsNewPath), `${site} ${previousId} What’s New artifact is missing`)
  const previousWhatsNewHtml = read(previousWhatsNewPath)
  assert(whatsNewHtml.includes('New pages') && whatsNewHtml.includes('Updated pages'), `${site} What’s New groups are missing`)
  assertVersionChangesSummary(whatsNewHtml, currentId, `${site} current What’s New summary selected the wrong version`)
  assertVersionChangesSummary(previousWhatsNewHtml, previousId, `${site} ${previousId} What’s New summary selected the wrong version`)
  assertSameStrings(
    linksWithClass(whatsNewHtml, 'section-link'),
    localeChangeLinks,
    `${site} What’s New section links are not the exact ${currentId} change set`,
  )
  assertSameStrings(
    linksWithClass(whatsNewHtml, 'change-card-link'),
    localeChangeRoutes,
    `${site} What’s New page links are not the exact ${currentId} change set`,
  )
  assertSameStrings(
    versionPickerIds(whatsNewHtml),
    versionIds,
    `${site} What’s New version picker does not expose every documentation version`,
  )
  assertSameStrings(
    linksWithClass(previousWhatsNewHtml, 'section-link'),
    localePreviousChangeLinks,
    `${site} ${previousId} What’s New section links are not isolated from ${currentId}`,
  )
  assertSameStrings(
    linksWithClass(previousWhatsNewHtml, 'change-card-link'),
    localePreviousChangeRoutes,
    `${site} ${previousId} What’s New page links are not isolated from ${currentId}`,
  )

  for (const { route, id } of currentChanges) {
    const currentPage = join(siteRoot, route, 'index.html')
    const previousPage = join(siteRoot, 'v', previousId, route, 'index.html')
    const historicalPage = join(siteRoot, 'v', historicalId, route, 'index.html')
    for (const required of [currentPage, previousPage])
      assert(existsSync(required), `${site} documentation change artifact is missing: ${required}`)

    const currentPageHtml = read(currentPage)
    assert(
      currentPageHtml.includes(`id="${id}"`)
      && currentPageHtml.includes(`data-sveltepress-introduced-in="${currentId}"`),
      `${site} current documentation marker is missing or has the wrong version: ${id}`,
    )
    assert(
      !read(previousPage).includes(`id="${id}"`),
      `${site} ${currentId} marker leaked into ${previousId}: ${id}`,
    )

    if (route === 'guide/version-management') {
      assert(!existsSync(historicalPage), `${site} post-${historicalId} page leaked into ${historicalId}: ${route}`)
    }
    else {
      assert(existsSync(historicalPage), `${site} ${historicalId} documentation page is missing: ${route}`)
      assert(
        !read(historicalPage).includes(`id="${id}"`),
        `${site} ${currentId} marker leaked into ${historicalId}: ${id}`,
      )
    }
  }

  const previousViteReference = read(join(siteRoot, 'v', previousId, 'reference/vite-plugin/index.html'))
  assert(
    previousViteReference.includes('id="version-change-discovery"')
    && previousViteReference.includes(`data-sveltepress-introduced-in="${previousId}"`),
    `${site} ${previousId} Vite reference did not preserve its frozen change marker`,
  )
  assert(
    !read(join(siteRoot, 'v', historicalId, 'reference/vite-plugin/index.html')).includes('id="version-change-discovery"'),
    `${site} ${previousId} Vite marker leaked into ${historicalId}`,
  )

  const codeRelatedPath = join('guide', 'default-theme', 'code-related', 'index.html')
  const currentCodeRelated = read(join(siteRoot, codeRelatedPath))
  const previousCodeRelated = read(join(siteRoot, 'v', previousId, codeRelatedPath))
  const historicalCodeRelated = read(join(siteRoot, 'v', historicalId, codeRelatedPath))
  for (const slug of changedCodeRelatedTocSlugs[site]) {
    assertTableOfContentsBadge(
      currentCodeRelated,
      slug,
      true,
      `${site} current ${slug} table-of-contents heading is missing its New badge`,
    )
    assertTableOfContentsBadge(
      previousCodeRelated,
      slug,
      false,
      `${site} current ${slug} table-of-contents badge leaked into ${previousId}`,
    )
    assertTableOfContentsBadge(
      historicalCodeRelated,
      slug,
      false,
      `${site} current ${slug} table-of-contents badge leaked into ${historicalId}`,
    )
  }
}

const currentHome = join(official, 'index.html')
const historicalHome = join(historicalRoot, 'index.html')
const previousHome = join(previousRoot, 'index.html')
const currentFeature = join(official, 'guide/version-management/index.html')
const historicalFeature = join(historicalRoot, 'guide/version-management/index.html')
const previousFeature = join(previousRoot, 'guide/version-management/index.html')
const currentWhatsNew = join(official, 'whats-new/index.html')

for (const required of [currentHome, historicalHome, previousHome, currentFeature, previousFeature, currentWhatsNew, join(official, 'llms.txt'), join(historicalRoot, 'llms.txt'), join(previousRoot, 'llms.txt'), join(official, 'sitemap.xml'), join(official, 'sw.js')])
  assert(existsSync(required), `Missing production artifact: ${required}`)
assert(!existsSync(historicalFeature), 'A page added after the snapshot leaked into historical routes')

const historicalHtml = read(historicalHome)
const previousHtml = read(previousHome)
const currentHtml = read(currentHome)
const currentFeatureHtml = read(currentFeature)
assert(historicalHtml.includes('<link rel="canonical" href="/v/2026-08-27/"'), 'Historical home is not self-canonical')
assert(historicalHtml.includes('You are viewing an older version of this site. Some features may not work as expected.'), 'Historical lifecycle message is missing')
assert(historicalHtml.includes('Current version'), 'Historical current-version link is missing')
assert(historicalHtml.includes('Search is not available for this documentation version.'), 'Historical search did not fail closed')
assertVersionSelectorLabel(currentHtml, currentId, 'Current version selector label is missing')
assertVersionSelectorLabel(previousHtml, previousId, 'Previous version selector label is missing')
assertVersionSelectorLabel(historicalHtml, historicalId, 'Historical version selector label is missing')
assert(
  currentFeatureHtml.includes('data-version-artifact-live-code')
  && currentFeatureHtml.includes('Artifact self-check passed'),
  'The version-management LiveCode artifact self-check was not server-rendered',
)
assertCurrentDocumentationChanges('', official)

const currentLlms = read(join(official, 'llms.txt'))
const historicalLlms = read(join(historicalRoot, 'llms.txt'))
assert(currentLlms.includes('Document version management'), 'Current llms.txt omits the version-management guide')
assert(historicalLlms.includes('Quick Start'), 'Historical llms.txt omits frozen documentation pages')
assert(!historicalLlms.includes('Document version management'), 'Historical llms.txt contains post-snapshot content')
const mergedSitemap = read(join(official, 'sitemap.xml'))
assert(mergedSitemap.includes('/guide/'), 'Merged sitemap omits current documentation routes')
assert(mergedSitemap.includes('hreflang="zh"') && mergedSitemap.includes('hreflang="bn"'), 'Merged sitemap omits locale hreflang alternates')
assert(mergedSitemap.includes('/zh/guide/'), 'Merged sitemap omits the Chinese locale routes')

const serviceWorker = read(join(official, 'sw.js'))
assert(serviceWorker.includes('sveltepress-version-pages'), 'Historical runtime cache is absent from the service worker')
assert(!serviceWorker.includes(`v/${historicalId}/index.html`), 'Historical HTML was added to the precache')
assert(!serviceWorker.includes(`v/${previousId}/index.html`), 'Previous-version HTML was added to the precache')

const versionRuntimeMarkers = [
  'Documentation version',
  'version-selector',
  'resolveVersionContext',
  'resolveVersionedPath',
]
// The merged site's locale builds (run via `sveltepress versions build
// --locale zh|bn`) produce locale-prefixed version routes. Verify them once
// those builds have run; the default-locale build always produces them.
for (const locale of ['zh', 'bn']) {
  const siteRoot = join(official, locale)
  if (!existsSync(join(siteRoot, 'v', historicalId, 'index.html')))
    continue
  const currentFeature = join(siteRoot, 'guide/version-management/index.html')
  const appRoot = join(official, '_app')
  const bundled = existsSync(appRoot) ? files(appRoot).map(read).join('\n') : ''
  assert(
    read(currentFeature).includes('data-version-artifact-live-code'),
    `/${locale}/ version-management LiveCode artifact self-check was not server-rendered`,
  )
  for (const marker of versionRuntimeMarkers)
    assert(bundled.includes(marker), `/${locale}/ bundled version-only runtime marker missing: ${marker}`)

  const historicalRoot = join(siteRoot, 'v', historicalId)
  const historicalHome = join(historicalRoot, 'index.html')
  const previousRoot = join(siteRoot, 'v', previousId)
  const previousHome = join(previousRoot, 'index.html')
  assert(existsSync(historicalHome), `/${locale}/ historical snapshot did not build: ${historicalHome}`)
  assert(existsSync(previousHome), `/${locale}/ previous snapshot did not build: ${previousHome}`)
  const historicalHtml = read(historicalHome)
  const currentHtml = read(join(siteRoot, 'index.html'))
  const previousHtml = read(previousHome)
  assert(historicalHtml.includes(`rel="canonical" href="/${locale}/v/${historicalId}/"`), `/${locale}/ historical home is not self-canonical`)
  assert(historicalHtml.includes('version-lifecycle'), `/${locale}/ historical lifecycle banner is missing`)
  assertVersionSelectorLabel(currentHtml, currentId, `/${locale}/ current version selector label is missing`)
  assertVersionSelectorLabel(previousHtml, previousId, `/${locale}/ previous version selector label is missing`)
  assertVersionSelectorLabel(historicalHtml, historicalId, `/${locale}/ historical version selector label is missing`)
  assert(historicalHtml.includes('Search is not available for this documentation version'), `/${locale}/ historical search did not fail closed`)
  assertCurrentDocumentationChanges(locale, siteRoot)
}

console.log('Version-management production artifacts verified.')
