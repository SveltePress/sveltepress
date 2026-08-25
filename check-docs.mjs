import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = dirname(fileURLToPath(import.meta.url))
const docsSites = ['docs-site', 'docs-site-zh', 'docs-site-bn']
const failures = []

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
  const pages = walk(routesDir)
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
    ...walk(join(root, 'packages', site, 'src', 'routes')),
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
  [/search:\s*['"]\/src\//, 'unsupported custom search path example'],
]

for (const path of activeFiles) {
  const content = read(path)
  for (const [pattern, message] of forbidden) {
    if (pattern.test(content))
      fail(`${message}: ${relative(root, path)}`)
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
