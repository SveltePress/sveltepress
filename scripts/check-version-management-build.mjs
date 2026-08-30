import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const official = join(root, 'packages/docs-site/dist')
const historicalId = '2026-08-27'
const historicalRoot = join(official, 'v', historicalId)

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

const currentHome = join(official, 'index.html')
const historicalHome = join(historicalRoot, 'index.html')
const currentFeature = join(official, 'guide/version-management/index.html')
const historicalFeature = join(historicalRoot, 'guide/version-management/index.html')
const currentWhatsNew = join(official, 'whats-new/index.html')
const currentViteReference = join(official, 'reference/vite-plugin/index.html')

for (const required of [currentHome, historicalHome, currentFeature, currentWhatsNew, currentViteReference, join(official, 'llms.txt'), join(historicalRoot, 'llms.txt'), join(official, 'sitemap.xml'), join(official, 'sw.js')])
  assert(existsSync(required), `Missing production artifact: ${required}`)
assert(!existsSync(historicalFeature), 'A page added after the snapshot leaked into historical routes')

const historicalHtml = read(historicalHome)
const currentHtml = read(currentHome)
assert(historicalHtml.includes('<link rel="canonical" href="/v/2026-08-27/"'), 'Historical home is not self-canonical')
assert(historicalHtml.includes('You are viewing an older version of this site. Some features may not work as expected.'), 'Historical lifecycle message is missing')
assert(historicalHtml.includes('Current version'), 'Historical current-version link is missing')
assert(historicalHtml.includes('Search is not available for this documentation version.'), 'Historical search did not fail closed')
assert(currentHtml.includes('2026-08-28') && historicalHtml.includes('2026-08-27'), 'Version selector labels are missing')
const whatsNewHtml = read(currentWhatsNew)
assert(whatsNewHtml.includes('New pages') && whatsNewHtml.includes('Updated pages'), 'What’s New groups are missing')
assert(whatsNewHtml.includes('/guide/version-management/') && whatsNewHtml.includes('/reference/vite-plugin/#version-change-discovery'), 'What’s New links do not cover new and updated documentation')
const viteReferenceHtml = read(currentViteReference)
assert(
  viteReferenceHtml.includes('id="version-change-discovery"')
  && viteReferenceHtml.includes('data-sveltepress-introduced-in="2026-08-28"')
  && viteReferenceHtml.includes('data-sveltepress-version-label-template="New in __SVELTEPRESS_VERSION__"'),
  'The real since marker was not rendered',
)

const currentLlms = read(join(official, 'llms.txt'))
const historicalLlms = read(join(historicalRoot, 'llms.txt'))
assert(currentLlms.includes('Document version management'), 'Current llms.txt omits the version-management guide')
assert(historicalLlms.includes('Quick Start'), 'Historical llms.txt omits frozen documentation pages')
assert(!historicalLlms.includes('Document version management'), 'Historical llms.txt contains post-snapshot content')
assert(read(join(official, 'sitemap.xml')).includes(`/v/${historicalId}/`), 'Historical stable/deprecated routes are absent from sitemap.xml')

const serviceWorker = read(join(official, 'sw.js'))
assert(serviceWorker.includes('sveltepress-version-pages'), 'Historical runtime cache is absent from the service worker')
assert(!serviceWorker.includes(`v/${historicalId}/index.html`), 'Historical HTML was added to the precache')

const versionRuntimeMarkers = [
  'Documentation version',
  'version-selector',
  'resolveVersionContext',
  'resolveVersionedPath',
]
for (const site of ['docs-site-zh', 'docs-site-bn']) {
  const siteRoot = join(root, 'packages', site, 'dist')
  const appRoot = join(siteRoot, '_app')
  const bundled = files(appRoot).map(read).join('\n')
  for (const marker of versionRuntimeMarkers)
    assert(bundled.includes(marker), `${site} bundled version-only runtime marker missing: ${marker}`)

  const historicalRoot = join(siteRoot, 'v', historicalId)
  const historicalHome = join(historicalRoot, 'index.html')
  assert(existsSync(historicalHome), `${site} historical snapshot did not build: ${historicalHome}`)
  const historicalHtml = read(historicalHome)
  assert(historicalHtml.includes(`rel="canonical" href="/v/${historicalId}/"`), `${site} historical home is not self-canonical`)
  assert(historicalHtml.includes('version-lifecycle'), `${site} historical lifecycle banner is missing`)
  assert(historicalHtml.includes('version-selector'), `${site} historical version selector is missing`)
  assert(historicalHtml.includes('Search is not available for this documentation version'), `${site} historical search did not fail closed`)

  const currentWhatsNew = read(join(siteRoot, 'whats-new/index.html'))
  assert(currentWhatsNew.includes('New pages') && currentWhatsNew.includes('Updated pages'), `${site} What's New groups are missing`)
  assert(currentWhatsNew.includes('/guide/version-management/') && currentWhatsNew.includes('/reference/vite-plugin/#version-change-discovery'), `${site} What's New links do not cover new and updated documentation`)
}

console.log('Version-management production artifacts verified.')
