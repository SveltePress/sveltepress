import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'

export const VERSION_ARTIFACT_MANIFEST_SCHEMA = 1

export interface VersionArtifactFingerprints {
  artifactSchema: string
  pageCompiler: string
  shell: string
  index: string
  planner: string
}

export interface VersionArtifactParent {
  versionId: string
  manifestHash: string
}

export interface VersionArtifactLineageEntry extends VersionArtifactParent {}

export interface PageArtifactInput {
  route: string
  inputHash: string
  files: string[]
  dependencies: string[]
}

export interface PageArtifactRecord extends PageArtifactInput {
  artifactHash: string
}

export interface VersionArtifactManifest {
  schemaVersion: number
  siteId: string
  versionId: string
  parent: VersionArtifactParent | null
  fingerprints: VersionArtifactFingerprints
  pages: Record<string, PageArtifactRecord>
  removedRoutes: string[]
  lineage: VersionArtifactLineageEntry[]
}

export interface CreateVersionArtifactManifestInput {
  siteId: string
  versionId: string
  parent: VersionArtifactParent | null
  fingerprints: VersionArtifactFingerprints
  pages: PageArtifactRecord[]
  removedRoutes: string[]
  lineage?: VersionArtifactLineageEntry[]
}

export interface VersionBuildPlan {
  siteId: string
  versionId: string
  parent: VersionArtifactParent
  fingerprints: VersionArtifactFingerprints
  pages: PageArtifactInput[]
  compiledRoutes: string[]
  reusedRoutes: string[]
  removedRoutes: string[]
  recomposedRoutes: string[]
  fullRebuild: boolean
  invalidationReasons: string[]
}

export function createVersionArtifactManifest(input: CreateVersionArtifactManifestInput): VersionArtifactManifest {
  const pages = Object.fromEntries(
    [...input.pages]
      .sort((a, b) => a.route.localeCompare(b.route))
      .map(page => [page.route, normalizePageRecord(page)]),
  )
  return {
    schemaVersion: VERSION_ARTIFACT_MANIFEST_SCHEMA,
    siteId: input.siteId,
    versionId: input.versionId,
    parent: input.parent ? { ...input.parent } : null,
    fingerprints: { ...input.fingerprints },
    pages,
    removedRoutes: uniqueSorted(input.removedRoutes),
    lineage: [...(input.lineage ?? [])].map(entry => ({ ...entry })),
  }
}

export function planVersionBuild(input: {
  siteId: string
  versionId: string
  previous: VersionArtifactManifest
  pages: PageArtifactInput[]
  fingerprints: VersionArtifactFingerprints
}): VersionBuildPlan {
  validateVersionArtifactManifest(input.previous)
  if (input.previous.siteId !== input.siteId) {
    throw new Error(
      `[sveltepress:versions] Previous artifact belongs to site "${input.previous.siteId}", not "${input.siteId}".`,
    )
  }

  const invalidationReasons: string[] = []
  const pageIncompatible = input.previous.fingerprints.artifactSchema !== input.fingerprints.artifactSchema
    || input.previous.fingerprints.pageCompiler !== input.fingerprints.pageCompiler
  if (input.previous.fingerprints.artifactSchema !== input.fingerprints.artifactSchema)
    invalidationReasons.push('artifact schema changed')
  if (input.previous.fingerprints.pageCompiler !== input.fingerprints.pageCompiler)
    invalidationReasons.push('page compiler fingerprint changed')
  if (input.previous.fingerprints.shell !== input.fingerprints.shell)
    invalidationReasons.push('shell fingerprint changed')
  if (input.previous.fingerprints.index !== input.fingerprints.index)
    invalidationReasons.push('index fingerprint changed')
  if (input.previous.fingerprints.planner !== input.fingerprints.planner)
    invalidationReasons.push('planner fingerprint changed')

  const pages = [...input.pages].map(normalizePageInput).sort((a, b) => a.route.localeCompare(b.route))
  const currentRoutes = new Set(pages.map(page => page.route))
  const compiledRoutes: string[] = []
  const reusedRoutes: string[] = []
  for (const page of pages) {
    const previous = input.previous.pages[page.route]
    if (pageIncompatible || !previous || previous.inputHash !== page.inputHash)
      compiledRoutes.push(page.route)
    else
      reusedRoutes.push(page.route)
  }
  const removedRoutes = Object.keys(input.previous.pages)
    .filter(route => !currentRoutes.has(route))
    .sort((a, b) => a.localeCompare(b))

  return {
    siteId: input.siteId,
    versionId: input.versionId,
    parent: {
      versionId: input.previous.versionId,
      manifestHash: artifactManifestHash(input.previous),
    },
    fingerprints: { ...input.fingerprints },
    pages,
    compiledRoutes,
    reusedRoutes,
    removedRoutes,
    recomposedRoutes: pages.map(page => page.route),
    fullRebuild: pageIncompatible,
    invalidationReasons,
  }
}

export function artifactManifestHash(manifest: VersionArtifactManifest): string {
  return sha256(stableStringify(manifest))
}

export function validateVersionArtifactManifest(
  manifest: VersionArtifactManifest,
  previous?: VersionArtifactManifest,
): void {
  const errors: string[] = []
  if (!manifest || typeof manifest !== 'object')
    throw new Error('[sveltepress:versions] Version artifact manifest must be an object.')
  if (manifest.schemaVersion !== VERSION_ARTIFACT_MANIFEST_SCHEMA)
    errors.push(`schemaVersion must be ${VERSION_ARTIFACT_MANIFEST_SCHEMA}`)
  if (!isNonEmptyString(manifest.siteId))
    errors.push('siteId must be a non-empty string')
  if (!isNonEmptyString(manifest.versionId))
    errors.push('versionId must be a non-empty string')
  validateFingerprints(manifest.fingerprints, errors)
  if (!manifest.pages || typeof manifest.pages !== 'object' || Array.isArray(manifest.pages)) {
    errors.push('pages must be an object')
  }
  else {
    for (const [route, page] of Object.entries(manifest.pages)) {
      if (!route.startsWith('/') || page.route !== route)
        errors.push(`page "${route}" must contain its absolute route`)
      if (!isHashValue(page.inputHash) || !isHashValue(page.artifactHash))
        errors.push(`page "${route}" must contain inputHash and artifactHash`)
      if (!Array.isArray(page.files) || !page.files.every(isNonEmptyString))
        errors.push(`page "${route}" files must be strings`)
      if (!Array.isArray(page.dependencies) || !page.dependencies.every(isNonEmptyString))
        errors.push(`page "${route}" dependencies must be strings`)
    }
  }
  if (!Array.isArray(manifest.removedRoutes) || !manifest.removedRoutes.every(route => typeof route === 'string' && route.startsWith('/')))
    errors.push('removedRoutes must contain absolute routes')
  if (!Array.isArray(manifest.lineage))
    errors.push('lineage must be an array')
  if (manifest.parent !== null && (!manifest.parent || !isNonEmptyString(manifest.parent.versionId) || !isHashValue(manifest.parent.manifestHash)))
    errors.push('parent must contain versionId and manifestHash')
  if (previous) {
    if (!manifest.parent) {
      errors.push('parent is required when validating against a previous manifest')
    }
    else {
      if (manifest.parent.versionId !== previous.versionId)
        errors.push(`parent versionId must be "${previous.versionId}"`)
      if (manifest.parent.manifestHash !== artifactManifestHash(previous))
        errors.push('parent manifest hash does not match the previous manifest')
    }
  }
  if (errors.length)
    throw new Error(`[sveltepress:versions] Invalid version artifact manifest:\n- ${errors.join('\n- ')}`)
}

export function collectPageArtifactInputs(
  siteRoot: string,
  options: { basePath: string, routesDir?: string, excludeDirs?: string[] },
): PageArtifactInput[] {
  const routesRoot = resolve(siteRoot, options.routesDir ?? 'src/routes')
  const excludedRoots = [
    join(routesRoot, options.basePath.replace(/^\//, '')),
    ...(options.excludeDirs ?? []).map(dir => join(routesRoot, dir)),
  ]
  const pages = collectPageFiles(routesRoot, excludedRoots)
  return pages.map((pagePath) => {
    const route = routeFromPagePath(routesRoot, pagePath)
    const ownedFiles = collectPageOwnedFiles(pagePath)
    const dependencyFiles = collectTransitiveDependencies(siteRoot, ownedFiles)
    const allFiles = uniqueSorted([...ownedFiles, ...dependencyFiles])
    return {
      route,
      inputHash: hashFiles(siteRoot, allFiles, routesRoot),
      files: ownedFiles.map(file => normalizeRelative(siteRoot, file)),
      dependencies: dependencyFiles.map(file => normalizeRelative(siteRoot, file)),
    }
  }).sort((a, b) => a.route.localeCompare(b.route))
}

function collectPageFiles(root: string, excludedRoots: string[]): string[] {
  if (!existsSync(root))
    return []
  const excluded = new Set(excludedRoots.map(path => resolve(path)))
  const files: string[] = []
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (excluded.has(resolve(path)))
        continue
      if (entry.isDirectory())
        visit(path)
      else if (entry.isFile() && /^\+page(?:@[\w-]+)?\.(?:md|svelte)$/.test(entry.name))
        files.push(path)
    }
  }
  visit(root)
  return files.sort()
}

function collectPageOwnedFiles(pagePath: string): string[] {
  const directory = dirname(pagePath)
  const files = [pagePath]
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === pagePath.slice(directory.length + 1))
      continue
    if (/^\+page(?:\.server)?\.[cm]?[jt]s$/.test(entry.name))
      files.push(join(directory, entry.name))
  }
  return files.sort()
}

function collectTransitiveDependencies(siteRoot: string, entryFiles: string[]): string[] {
  const entries = new Set(entryFiles.map(file => resolve(file)))
  const visited = new Set<string>()
  const dependencies = new Set<string>()
  const queue = [...entryFiles]
  while (queue.length) {
    const file = resolve(queue.shift()!)
    if (visited.has(file) || !existsSync(file) || !statSync(file).isFile())
      continue
    visited.add(file)
    const source = readFileSync(file, 'utf8')
    for (const specifier of extractDependencies(file, source)) {
      const resolved = resolveDependency(siteRoot, file, specifier)
      if (!resolved || entries.has(resolved) || visited.has(resolved))
        continue
      dependencies.add(resolved)
      queue.push(resolved)
    }
  }
  return [...dependencies].sort()
}

function extractDependencies(file: string, source: string): string[] {
  const markdown = extname(file) === '.md'
  const dependencySource = markdown
    ? [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
    : source
  const markdownSource = markdown
    ? `${stripMarkdownExamples(source)}\n${extractSvelteLiveCode(source)}`
    : source
  const dependencies = new Set<string>()
  for (const match of dependencySource.matchAll(/(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)['"]([^'"]+)['"]/g))
    dependencies.add(match[1])
  for (const match of markdownSource.matchAll(/@code\(([^,\s)]+)/g))
    dependencies.add(match[1])
  for (const match of markdownSource.matchAll(/(?:\bsrc\s*=\s*|\bposter\s*=\s*)['"]([^'"]+)['"]|url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))
    dependencies.add(match[1] ?? match[2])
  for (const match of markdownSource.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g))
    dependencies.add(match[1].trim().split(/\s+/, 1)[0])
  return [...dependencies]
}

function resolveDependency(siteRoot: string, importer: string, specifier: string): string | null {
  let target: string
  if (specifier.startsWith('$lib/'))
    target = resolve(siteRoot, 'src/lib', specifier.slice('$lib/'.length))
  else if (specifier.startsWith('/'))
    target = resolve(siteRoot, 'static', specifier.slice(1))
  else if (specifier.startsWith('.'))
    target = resolve(dirname(importer), specifier)
  else
    return null
  return resolveExistingFile(target)
}

function resolveExistingFile(target: string): string | null {
  const extensions = ['', '.svelte', '.md', '.ts', '.js', '.mjs', '.cjs', '.css', '.scss', '.sass', '.less', '.styl', '.json']
  for (const extension of extensions) {
    const candidate = `${target}${extension}`
    if (existsSync(candidate) && statSync(candidate).isFile())
      return resolve(candidate)
  }
  for (const extension of extensions.slice(1)) {
    const candidate = join(target, `index${extension}`)
    if (existsSync(candidate) && statSync(candidate).isFile())
      return resolve(candidate)
  }
  return null
}

function routeFromPagePath(routesRoot: string, pagePath: string): string {
  const directory = relative(routesRoot, dirname(pagePath))
    .split(sep)
    .filter(segment => segment && !/^\(.*\)$/.test(segment))
  return directory.length ? `/${directory.join('/')}/` : '/'
}

function hashFiles(siteRoot: string, files: string[], routesRoot: string): string {
  const hash = createHash('sha256')
  for (const file of files) {
    const routeRelative = relative(routesRoot, file)
    const canonicalPath = routeRelative && !routeRelative.startsWith(`..${sep}`) && routeRelative !== '..'
      ? `src/routes/${routeRelative.split(sep).join('/')}`
      : normalizeRelative(siteRoot, file)
    hash.update(canonicalPath)
    hash.update('\0')
    hash.update(readFileSync(file))
    hash.update('\0')
  }
  return hash.digest('hex')
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(sortValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortValue(nested)]),
    )
  }
  return value
}

function normalizePageInput(page: PageArtifactInput): PageArtifactInput {
  return {
    route: page.route,
    inputHash: page.inputHash,
    files: uniqueSorted(page.files),
    dependencies: uniqueSorted(page.dependencies),
  }
}

function normalizePageRecord(page: PageArtifactRecord): PageArtifactRecord {
  return {
    ...normalizePageInput(page),
    artifactHash: page.artifactHash,
  }
}

function normalizeRelative(root: string, path: string): string {
  return relative(root, path).split(sep).join('/')
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isHashValue(value: unknown): value is string {
  return isNonEmptyString(value)
}

function validateFingerprints(value: unknown, errors: string[]) {
  if (!value || typeof value !== 'object') {
    errors.push('fingerprints must be an object')
    return
  }
  for (const key of ['artifactSchema', 'pageCompiler', 'shell', 'index', 'planner'] as const) {
    if (!isNonEmptyString((value as VersionArtifactFingerprints)[key]))
      errors.push(`fingerprints.${key} must be a non-empty string`)
  }
}

function stripMarkdownExamples(source: string): string {
  let fence: '```' | '~~~' | null = null
  return source.split('\n').map((line) => {
    const trimmed = line.trimStart()
    if (!fence) {
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        fence = trimmed.startsWith('```') ? '```' : '~~~'
        return ''
      }
      return line.replace(/`[^`\n]+`/g, '')
    }
    if (trimmed.startsWith(fence))
      fence = null
    return ''
  }).join('\n')
}

function extractSvelteLiveCode(source: string): string {
  const blocks: string[] = []
  let marker: { character: '`' | '~', length: number } | null = null
  let collect = false
  let block: string[] = []
  for (const line of source.split('\n')) {
    const trimmed = line.trimStart()
    if (!marker) {
      const character = trimmed[0]
      if (character !== '`' && character !== '~')
        continue
      let markerLength = 0
      while (trimmed[markerLength] === character)
        markerLength += 1
      if (markerLength < 3)
        continue
      const tokens = trimmed.slice(markerLength).trim().split(/\s+/).filter(Boolean)
      marker = {
        character,
        length: markerLength,
      }
      collect = tokens[0] === 'svelte' && tokens.slice(1).includes('live')
      block = []
      continue
    }
    const closing = line.trim()
    if (closing.length >= marker.length && [...closing].every(character => character === marker!.character)) {
      if (collect)
        blocks.push(block.join('\n'))
      marker = null
      collect = false
      block = []
      continue
    }
    if (collect)
      block.push(line)
  }
  return blocks.join('\n')
}
