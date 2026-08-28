import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { isHistoricalVersionRoute } from './check-utils.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const docsSites = ['docs-site', 'docs-site-zh', 'docs-site-bn']
const failures = []

function versionManifest(site) {
  const path = join(root, 'packages', site, 'sveltepress.versions.json')
  return existsSync(path) ? JSON.parse(read(path)) : null
}

function activeRouteFiles(site) {
  const routesDir = join(root, 'packages', site, 'src', 'routes')
  const manifest = versionManifest(site)
  return walk(routesDir).filter((path) => {
    if (!manifest)
      return true
    const routePath = relative(routesDir, path).split('\\').join('/')
    return !isHistoricalVersionRoute(routePath, manifest.basePath, manifest.versions.map(version => version.id))
  })
}

function walk(dir) {
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

const pageSets = new Map()
for (const site of docsSites) {
  const routesDir = join(root, 'packages', site, 'src', 'routes')
  const pages = activeRouteFiles(site)
    .filter(path => path.endsWith('+page.md'))
    .map(path => relative(routesDir, path))
    .sort()
  pageSets.set(site, pages)
}

const canonicalPages = pageSets.get('docs-site')
for (const site of docsSites.slice(1)) {
  const translatedPages = new Set(pageSets.get(site))
  const canonicalSet = new Set(canonicalPages)
  const missing = canonicalPages.filter(page => !translatedPages.has(page))
  const extra = pageSets.get(site).filter(page => !canonicalSet.has(page))
  if (missing.length)
    fail(`${site} is missing pages: ${missing.join(', ')}`)
  if (extra.length)
    fail(`${site} has extra pages: ${extra.join(', ')}`)
}

const packagesDir = join(root, 'packages')
const packageManifests = readdirSync(packagesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => join(packagesDir, entry.name, 'package.json'))
  .filter(existsSync)

const activeFiles = [
  join(root, 'README.md'),
  join(root, 'CONTRIBUTING.md'),
  join(root, 'CLAUDE.md'),
  ...packageManifests,
  ...walk(join(root, 'packages', 'create', 'template-js')),
  ...walk(join(root, 'packages', 'create', 'template-ts')),
  ...docsSites.flatMap(site => [
    ...activeRouteFiles(site),
    ...walk(join(root, 'packages', site, 'config')),
    join(root, 'packages', site, 'vite.config.ts'),
    join(root, 'packages', site, 'package.json'),
    join(root, 'packages', site, 'tsconfig.json'),
  ]),
].filter(path => ['.js', '.json', '.md', '.ts'].includes(extname(path)))

const forbidden = [
  [/Blackman99\/sveltepress/, 'legacy repository URL'],
  [/\bdarkTheme\b/, 'invalid default-theme option darkTheme; use themeDark'],
  [/Svelte \(3 and 4\)/i, 'stale Svelte 3/4 compatibility claim'],
  [/pnpm vite build && pnpm pagefind --site dist/, 'unrepeatable blog build command'],
  [/pnpm install && pnpm dev/, 'ambiguous monorepo demo command'],
  [/search:\s*['"]@sveltepress\/meilisearch\/Search\.svelte['"]/, 'Meilisearch component without required props'],
]

for (const path of activeFiles) {
  const content = read(path)
  for (const [pattern, message] of forbidden) {
    if (pattern.test(content))
      fail(`${message}: ${relative(root, path)}`)
  }
}

const defaultThemeSearchDocs = {
  'docs-site': {
    label: 'Default theme',
    caveatMarker: 'production build bug',
    guideSupportMarker: 'supports **Algolia DocSearch** through `docsearch` and custom search components through `search`, including `@sveltepress/meilisearch`',
    referenceSupportMarker: 'The supported custom-search hook, with type `Component | string`. Use it to integrate a Svelte search component such as `@sveltepress/meilisearch`.',
    staleClaimPatterns: [
      /not production-ready/i,
      /not a working production contract/i,
      /Do not use either through `defaultTheme\(\{ search \}\)` in production yet/i,
    ],
  },
  'docs-site-zh': {
    label: '默认主题',
    caveatMarker: '生产构建缺陷',
    guideSupportMarker: '默认主题支持通过 `docsearch` 接入 **Algolia DocSearch**，也支持通过 `search` 接入自定义搜索组件，包括 `@sveltepress/meilisearch`',
    referenceSupportMarker: '受支持的自定义搜索入口，类型为 `Component | string`，可用于接入 `@sveltepress/meilisearch` 等 Svelte 搜索组件。',
    staleClaimPatterns: [/尚不能用于生产|暂时不要配置|并不是可用的生产合同/],
  },
  'docs-site-bn': {
    label: 'Default theme',
    caveatMarker: 'production build bug',
    guideSupportMarker: 'Default theme `docsearch` দিয়ে **Algolia DocSearch** এবং `search` দিয়ে custom search component সমর্থন করে, যার মধ্যে `@sveltepress/meilisearch`-ও আছে',
    referenceSupportMarker: 'Supported custom-search hook; type `Component | string`। `@sveltepress/meilisearch`-এর মতো Svelte search component integrate করতে এটি ব্যবহার করুন।',
    staleClaimPatterns: [/production-ready নয়|কার্যকর production contract নয়/],
  },
}

for (const [site, docsConfig] of Object.entries(defaultThemeSearchDocs)) {
  const path = join(root, 'packages', site, 'src', 'routes', 'guide', 'themes', '+page.md')
  const defaultThemeRow = read(path)
    .split('\n')
    .find(line => line.startsWith(`| ${docsConfig.label} |`))

  if (!defaultThemeRow) {
    fail(`${site} theme comparison is missing its default-theme row`)
    continue
  }
  for (const integration of ['Algolia DocSearch', 'Meilisearch']) {
    if (!defaultThemeRow.includes(integration))
      fail(`${site} default-theme row must list ${integration} support`)
  }

  const docsPages = [
    {
      label: 'search guide',
      path: join(root, 'packages', site, 'src', 'routes', 'guide', 'default-theme', 'search', '+page.md'),
      supportMarker: docsConfig.guideSupportMarker,
    },
    {
      label: 'default-theme reference',
      path: join(root, 'packages', site, 'src', 'routes', 'reference', 'default-theme', '+page.md'),
      supportMarker: docsConfig.referenceSupportMarker,
    },
  ]
  for (const docsPage of docsPages) {
    expectSubstrings(
      docsPage.path,
      [
        [docsPage.supportMarker, 'a positive Meilisearch support statement'],
        [docsConfig.caveatMarker, 'the known production build caveat'],
      ],
      `${site} ${docsPage.label}`,
    )
    rejectPatterns(
      docsPage.path,
      docsConfig.staleClaimPatterns,
      `${site} ${docsPage.label}`,
    )
  }
}

const llmsOptions = interfaceKeys(join(root, 'packages', 'vite', 'src', 'types.ts'), 'LlmsConfig')
const defaultThemeOptions = interfaceKeys(join(root, 'packages', 'theme-default', 'types.d.ts'), 'DefaultThemeOptions')
const blogThemeOptions = interfaceKeys(join(root, 'packages', 'theme-blog', 'src', 'types.ts'), 'BlogThemeOptions')

for (const site of docsSites) {
  const routes = join(root, 'packages', site, 'src', 'routes')
  expectTokens(
    join(routes, 'reference', 'vite-plugin', '+page.md'),
    llmsOptions,
    `${site} llms reference`,
  )
  expectTokens(
    join(routes, 'reference', 'default-theme', '+page.md'),
    [...defaultThemeOptions, 'themeDark', 'codeCollapseLines', 'primaryDeep', 'expandCode'],
    `${site} default-theme reference`,
  )
  expectTokens(
    join(routes, 'guide', 'blog-theme', 'configuration', '+page.md'),
    blogThemeOptions,
    `${site} blog-theme reference`,
  )
}

const blogPackage = JSON.parse(read(join(root, 'packages', 'theme-blog', 'package.json')))
const publicComponents = Object.keys(blogPackage.exports)
  .filter(key => key.endsWith('.svelte'))
  .map(key => `@sveltepress/theme-blog/${key.replace(/^\.\//, '')}`)

for (const site of docsSites) {
  const path = join(root, 'packages', site, 'src', 'routes', 'guide', 'blog-theme', 'customization', '+page.md')
  const content = read(path)
  for (const component of publicComponents) {
    if (!content.includes(component))
      fail(`${site} public component reference is missing ${component}`)
  }
}

const versionManagementFeatures = {
  'docs-site': {
    title: 'Document version management',
    description: 'Keep current docs at clean URLs while publishing immutable historical snapshots with built-in version navigation and release change catalogs.',
  },
  'docs-site-zh': {
    title: '文档版本管理',
    description: '让当前文档保持简洁 URL，同时发布不可变的历史快照，并提供内置版本导航和发布变化总览。',
  },
  'docs-site-bn': {
    title: 'ডকুমেন্টেশন ভার্সন ম্যানেজমেন্ট',
    description: 'বর্তমান ডকুমেন্টেশনকে পরিচ্ছন্ন URL-এ রেখে অপরিবর্তনীয় ঐতিহাসিক স্ন্যাপশট প্রকাশ করুন; সঙ্গে পান অন্তর্নির্মিত ভার্সন নেভিগেশন ও রিলিজ পরিবর্তনের তালিকা।',
  },
}

for (const [site, expected] of Object.entries(versionManagementFeatures)) {
  const homePath = join(root, 'packages', site, 'src', 'routes', '+page.md')
  const feature = homeFeatureCards(homePath).find(card => card.title === expected.title)
  if (!feature) {
    fail(`${site} home page is missing the localized version-management feature card`)
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
      fail(`${site} version-management feature card does not match ${JSON.stringify(expectedFeature)}: ${relative(root, homePath)}`)
  }
  expectSubstrings(
    join(root, 'packages', site, 'vite.config.ts'),
    [[`'material-symbols': ['history']`, 'the prebuilt version-management icon']],
    `${site} icon config`,
  )
}

const packageNames = docsSites.map((site) => {
  const path = join(root, 'packages', site, 'package.json')
  return JSON.parse(read(path)).name
})
if (new Set(packageNames).size !== packageNames.length)
  fail(`documentation package names must be unique: ${packageNames.join(', ')}`)

if (failures.length) {
  console.error('Documentation checks failed:')
  for (const failure of failures)
    console.error(`- ${failure}`)
  process.exitCode = 1
}
else {
  console.warn(`Documentation checks passed for ${canonicalPages.length} pages across ${docsSites.length} locales.`)
}
