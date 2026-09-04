import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { hasPrebuiltIconifyIcon, isHistoricalVersionRoute } from './check-utils.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const docsPackage = 'docs-site'
const locales = [
  { dir: '', name: 'en', manifest: 'sveltepress.versions.json' },
  { dir: 'zh', name: 'zh', manifest: 'sveltepress.versions.zh.json' },
  { dir: 'bn', name: 'bn', manifest: 'sveltepress.versions.bn.json' },
]
const failures = []

function localeRoutesDir(locale) {
  return locale
    ? join(root, 'packages', docsPackage, 'src', 'routes', locale)
    : join(root, 'packages', docsPackage, 'src', 'routes')
}

function versionManifest(locale) {
  const path = join(root, 'packages', docsPackage, locale.manifest)
  return existsSync(path) ? JSON.parse(read(path)) : null
}

function activeRouteFiles(locale) {
  const routesDir = localeRoutesDir(locale.dir)
  const manifest = versionManifest(locale)
  const localeDirs = locales.map(other => other.dir).filter(Boolean)
  return walk(routesDir).filter((path) => {
    if (!manifest)
      return true
    const routePath = relative(routesDir, path).split('\\').join('/')
    if (!locale.dir && localeDirs.some(dir => routePath === dir || routePath.startsWith(`${dir}/`)))
      return false
    return !isHistoricalVersionRoute(routePath, manifest.basePath, manifest.versions.map(version => version.id))
  })
}

function walk(dir) {
  if (!existsSync(dir))
    return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function read(path) {
  return readFileSync(path, 'utf8')
}

function fail(message) {
  failures.push(message)
}

function expectTokens(path, tokens, label) {
  if (!existsSync(path)) {
    fail(`${label} is missing its page: ${relative(root, path)}`)
    return
  }
  const content = read(path)
  for (const token of tokens) {
    if (!content.includes(`\`${token}\``))
      fail(`${label} is missing \`${token}\`: ${relative(root, path)}`)
  }
}

function expectSubstrings(path, expectations, label) {
  const content = read(path)
  for (const [substring, description] of expectations) {
    if (!content.includes(substring))
      fail(`${label} is missing ${description}: ${relative(root, path)}`)
  }
}

function homeFeatureCards(path) {
  const lines = read(path).split('\n')
  const featuresStart = lines.findIndex(line => line === 'features:')
  if (featuresStart === -1) {
    fail(`home page is missing its features frontmatter: ${relative(root, path)}`)
    return []
  }

  const cards = []
  let card
  for (const line of lines.slice(featuresStart + 1)) {
    if (line && !line.startsWith(' '))
      break

    const title = line.match(/^ {2}- title: (.+)$/)?.[1]
    if (title) {
      if (card)
        cards.push(card)
      card = { title }
      continue
    }
    if (!card)
      continue

    const field = line.match(/^ {4}(description|link): (.+)$/)
    if (field) {
      card[field[1]] = field[2]
      continue
    }
    const iconField = line.match(/^ {6}(type|collection|name): (.+)$/)
    if (iconField) {
      card.icon ??= {}
      card.icon[iconField[1]] = iconField[2]
    }
  }
  if (card)
    cards.push(card)
  return cards
}

function rejectPatterns(path, patterns, label) {
  const content = read(path)
  for (const pattern of patterns) {
    if (pattern.test(content))
      fail(`${label} contains a stale unsupported-search claim: ${relative(root, path)}`)
  }
}

function interfaceKeys(path, interfaceName) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true)
  let keys

  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      keys = node.members
        .filter(member => ts.isPropertySignature(member) && member.name)
        .map((member) => {
          if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
            return member.name.text
          return member.name.getText(source)
        })
      return
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  if (!keys) {
    fail(`cannot find interface ${interfaceName} in ${relative(root, path)}`)
    return []
  }
  return keys
}

// The merged site's locale directories must mirror each other: the English
// (canonical) page set must equal the Chinese and Bengali page sets.
const canonicalPages = activeRouteFiles(locales[0])
  .filter(path => path.endsWith('+page.md'))
  .map(path => relative(localeRoutesDir(''), path))
  .sort()
for (const locale of locales.slice(1)) {
  const translatedPages = activeRouteFiles(locale)
    .filter(path => path.endsWith('+page.md'))
    .map(path => relative(localeRoutesDir(locale.dir), path))
    .sort()
  const canonicalSet = new Set(canonicalPages)
  const missing = canonicalPages.filter(page => !translatedPages.includes(page))
  const extra = translatedPages.filter(page => !canonicalSet.has(page))
  if (missing.length)
    fail(`locale /${locale.dir}/ is missing pages: ${missing.join(', ')}`)
  if (extra.length)
    fail(`locale /${locale.dir}/ has extra pages: ${extra.join(', ')}`)
}

const packagesDir = join(root, 'packages')
const packageManifests = readdirSync(packagesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => join(packagesDir, entry.name, 'package.json'))
  .filter(existsSync)

const mergedConfigDir = join(root, 'packages', docsPackage, 'config')
const activeFiles = [
  join(root, 'README.md'),
  join(root, 'CONTRIBUTING.md'),
  join(root, 'CLAUDE.md'),
  ...packageManifests,
  ...walk(join(root, 'packages', 'create', 'template-js')),
  ...walk(join(root, 'packages', 'create', 'template-ts')),
  ...locales.flatMap(locale => activeRouteFiles(locale)),
  ...walk(mergedConfigDir),
  join(root, 'packages', docsPackage, 'vite.config.ts'),
  join(root, 'packages', docsPackage, 'package.json'),
  join(root, 'packages', docsPackage, 'tsconfig.json'),
].filter(path => ['.js', '.json', '.md', '.ts'].includes(extname(path)))

const forbidden = [
  [/Blackman99\/sveltepress/, 'legacy repository URL'],
  [/\bdarkTheme\b/, 'invalid default-theme option darkTheme; use themeDark'],
  [/Svelte \(3 and 4\)/i, 'stale Svelte 3/4 compatibility claim'],
  [/pnpm vite build && pnpm pagefind --site dist/, 'unrepeatable blog build command'],
  [/pnpm install && pnpm dev/, 'ambiguous monorepo demo command'],
  [/search:\s*['"]@sveltepress\/meilisearch\/Search\.svelte['"]/, 'Meilisearch component without required props'],
  [/cn\.sveltepress\.site|bn\.sveltepress\.site/, 'stale per-language domain link; the LocaleSelector replaces it'],
]

for (const path of activeFiles) {
  const content = read(path)
  for (const [pattern, message] of forbidden) {
    if (pattern.test(content))
      fail(`${message}: ${relative(root, path)}`)
  }
}

const defaultThemeSearchDocs = {
  '': {
    label: 'Default theme',
    productionMarker: 'bundled into static production builds',
    guideSupportMarker: 'supports **Algolia DocSearch** through `docsearch` and custom search components through `search`, including `@sveltepress/meilisearch`',
    referenceSupportMarker: 'The supported custom-search hook, with type `Component | string`. Use it to integrate a Svelte search component such as `@sveltepress/meilisearch`.',
    staleClaimPatterns: [
      /not production-ready/i,
      /not a working production contract/i,
      /Do not use either through `defaultTheme\(\{ search \}\)` in production yet/i,
    ],
  },
  'zh': {
    label: '默认主题',
    productionMarker: '被打进静态生产构建',
    guideSupportMarker: '默认主题支持通过 `docsearch` 接入 **Algolia DocSearch**，也支持通过 `search` 接入自定义搜索组件，包括 `@sveltepress/meilisearch`',
    referenceSupportMarker: '受支持的自定义搜索入口，类型为 `Component | string`，可用于接入 `@sveltepress/meilisearch` 等 Svelte 搜索组件。',
    staleClaimPatterns: [/尚不能用于生产|暂时不要配置|并不是可用的生产合同/],
  },
  'bn': {
    label: 'Default theme',
    productionMarker: 'static production build-এ bundle',
    guideSupportMarker: 'Default theme `docsearch` দিয়ে **Algolia DocSearch** এবং `search` দিয়ে custom search component সমর্থন করে, যার মধ্যে `@sveltepress/meilisearch`-ও আছে',
    referenceSupportMarker: 'Supported custom-search hook; type `Component | string`। `@sveltepress/meilisearch`-এর মতো Svelte search component integrate করতে এটি ব্যবহার করুন।',
    staleClaimPatterns: [/production-ready নয়|কার্যকর production contract নয়/],
  },
}

for (const locale of locales) {
  const routes = localeRoutesDir(locale.dir)
  const docsConfig = defaultThemeSearchDocs[locale.dir]
  const localeLabel = locale.dir ? `/${locale.dir}/` : '/'
  const path = join(routes, 'guide', 'themes', '+page.md')
  if (!existsSync(path)) {
    fail(`${localeLabel} theme comparison is missing: ${relative(root, path)}`)
    continue
  }
  const defaultThemeRow = read(path)
    .split('\n')
    .find(line => line.startsWith(`| ${docsConfig.label} |`))

  if (!defaultThemeRow) {
    fail(`${localeLabel} theme comparison is missing its default-theme row`)
    continue
  }
  for (const integration of ['Algolia DocSearch', 'Meilisearch']) {
    if (!defaultThemeRow.includes(integration))
      fail(`${localeLabel} default-theme row must list ${integration} support`)
  }

  const docsPages = [
    {
      label: 'search guide',
      path: join(routes, 'guide', 'default-theme', 'search', '+page.md'),
      supportMarker: docsConfig.guideSupportMarker,
    },
    {
      label: 'default-theme reference',
      path: join(routes, 'reference', 'default-theme', '+page.md'),
      supportMarker: docsConfig.referenceSupportMarker,
    },
  ]
  for (const docsPage of docsPages) {
    if (!existsSync(docsPage.path)) {
      fail(`${localeLabel} ${docsPage.label} is missing: ${relative(root, docsPage.path)}`)
      continue
    }
    expectSubstrings(
      docsPage.path,
      [
        [docsPage.supportMarker, 'a positive Meilisearch support statement'],
        [docsConfig.productionMarker, 'a production source-path statement'],
      ],
      `${localeLabel} ${docsPage.label}`,
    )
    rejectPatterns(
      docsPage.path,
      docsConfig.staleClaimPatterns,
      `${localeLabel} ${docsPage.label}`,
    )
  }
}

const llmsOptions = interfaceKeys(join(root, 'packages', 'vite', 'src', 'types.ts'), 'LlmsConfig')
const defaultThemeOptions = interfaceKeys(join(root, 'packages', 'theme-default', 'types.d.ts'), 'DefaultThemeOptions')
const blogThemeOptions = interfaceKeys(join(root, 'packages', 'theme-blog', 'src', 'types.ts'), 'BlogThemeOptions')

for (const locale of locales) {
  const routes = localeRoutesDir(locale.dir)
  const localeLabel = locale.dir ? `/${locale.dir}/` : '/'
  expectTokens(
    join(routes, 'reference', 'vite-plugin', '+page.md'),
    llmsOptions,
    `${localeLabel} llms reference`,
  )
  expectTokens(
    join(routes, 'reference', 'default-theme', '+page.md'),
    [...defaultThemeOptions, 'themeDark', 'codeCollapseLines', 'primaryDeep', 'expandCode'],
    `${localeLabel} default-theme reference`,
  )
  expectTokens(
    join(routes, 'guide', 'blog-theme', 'configuration', '+page.md'),
    blogThemeOptions,
    `${localeLabel} blog-theme reference`,
  )
}

const blogPackage = JSON.parse(read(join(root, 'packages', 'theme-blog', 'package.json')))
const publicComponents = Object.keys(blogPackage.exports)
  .filter(key => key.endsWith('.svelte'))
  .map(key => `@sveltepress/theme-blog/${key.replace(/^\.\//, '')}`)

for (const locale of locales) {
  const routes = localeRoutesDir(locale.dir)
  const localeLabel = locale.dir ? `/${locale.dir}/` : '/'
  const path = join(routes, 'guide', 'blog-theme', 'customization', '+page.md')
  const content = read(path)
  for (const component of publicComponents) {
    if (!content.includes(component))
      fail(`${localeLabel} public component reference is missing ${component}`)
  }
}

const versionManagementFeatures = {
  '': {
    title: 'Document version management',
    description: 'Keep current docs at clean URLs while publishing immutable historical snapshots with built-in version navigation and release change catalogs.',
  },
  'zh': {
    title: '文档版本管理',
    description: '让当前文档保持简洁 URL，同时发布不可变的历史快照，并提供内置版本导航和发布变化总览。',
  },
  'bn': {
    title: 'ডকুমেন্টেশন ভার্সন ম্যানেজমেন্ট',
    description: 'বর্তমান ডকুমেন্টেশনকে পরিচ্ছন্ন URL-এ রেখে অপরিবর্তনীয় ঐতিহাসিক স্ন্যাপশট প্রকাশ করুন; সঙ্গে পান অন্তর্নির্মিত ভার্সন নেভিগেশন ও রিলিজ পরিবর্তনের তালিকা।',
  },
}

for (const locale of locales) {
  const localeLabel = locale.dir ? `/${locale.dir}/` : '/'
  const expected = versionManagementFeatures[locale.dir]
  const homePath = join(localeRoutesDir(locale.dir), '+page.md')
  if (/^tagline:/m.test(read(homePath)))
    fail(`${localeLabel} home page must not repeat its hero description as a tagline: ${relative(root, homePath)}`)
  const feature = homeFeatureCards(homePath).find(card => card.title === expected.title)
  if (!feature) {
    fail(`${localeLabel} home page is missing the localized version-management feature card`)
  }
  else {
    const expectedFeature = {
      ...expected,
      icon: {
        type: 'iconify',
        collection: 'material-symbols',
        name: 'history',
      },
      link: '/guide/version-management/',
    }
    if (JSON.stringify(feature) !== JSON.stringify(expectedFeature))
      fail(`${localeLabel} version-management feature card does not match ${JSON.stringify(expectedFeature)}: ${relative(root, homePath)}`)
  }
}

const viteConfigPath = join(root, 'packages', docsPackage, 'vite.config.ts')
const viteConfig = read(viteConfigPath)
const requiredHomeIcons = [
  ['history', 'the prebuilt version-management icon'],
  ['translate', 'the prebuilt i18n icon'],
  ['search', 'the prebuilt local-search icon'],
]
for (const [name, description] of requiredHomeIcons) {
  if (!hasPrebuiltIconifyIcon(viteConfig, 'material-symbols', name))
    fail(`icon config is missing ${description}: ${relative(root, viteConfigPath)}`)
}

if (failures.length) {
  console.error('Documentation checks failed:')
  for (const failure of failures)
    console.error(`- ${failure}`)
  process.exitCode = 1
}
else {
  console.warn(`Documentation checks passed for ${canonicalPages.length} pages across ${locales.length} locales.`)
}
