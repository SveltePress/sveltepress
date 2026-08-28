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

for (const required of [currentHome, historicalHome, currentFeature, join(official, 'llms.txt'), join(historicalRoot, 'llms.txt'), join(official, 'sitemap.xml'), join(official, 'sw.js')])
  assert(existsSync(required), `Missing production artifact: ${required}`)
assert(!existsSync(historicalFeature), 'A page added after the snapshot leaked into historical routes')

const historicalHtml = read(historicalHome)
const currentHtml = read(currentHome)
assert(historicalHtml.includes('<link rel="canonical" href="/v/2026-08-27/"'), 'Historical home is not self-canonical')
assert(historicalHtml.includes('This snapshot is preserved for compatibility.'), 'Historical lifecycle message is missing')
assert(historicalHtml.includes('Search is not available for this documentation version.'), 'Historical search did not fail closed')
assert(currentHtml.includes('2026-08-28') && historicalHtml.includes('2026-08-27'), 'Version selector labels are missing')

const currentLlms = read(join(official, 'llms.txt'))
const historicalLlms = read(join(historicalRoot, 'llms.txt'))
assert(currentLlms.includes('Document version management'), 'Current llms.txt omits the version-management guide')
assert(!historicalLlms.includes('Document version management'), 'Historical llms.txt contains post-snapshot content')
assert(read(join(official, 'sitemap.xml')).includes(`/v/${historicalId}/`), 'Historical stable/deprecated routes are absent from sitemap.xml')

const serviceWorker = read(join(official, 'sw.js'))
assert(serviceWorker.includes('sveltepress-version-pages'), 'Historical runtime cache is absent from the service worker')
assert(!serviceWorker.includes(`v/${historicalId}/index.html`), 'Historical HTML was added to the precache')

const forbiddenNoManifestMarkers = [
  'Documentation version',
  'svp-version-fallback',
  'This documentation version has reached end of life',
  'createVersionRuntime',
  'resolveVersionContext',
  'resolveVersionedPath',
  'version-selector',
  'version-fallback',
]
for (const site of ['docs-site-zh', 'docs-site-bn']) {
  const appRoot = join(root, 'packages', site, 'dist/_app')
  const bundled = files(appRoot).map(read).join('\n')
  for (const marker of forbiddenNoManifestMarkers)
    assert(!bundled.includes(marker), `${site} bundled version-only runtime marker: ${marker}`)
}

console.log('Version-management production artifacts verified.')
