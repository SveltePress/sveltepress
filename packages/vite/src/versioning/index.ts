import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { computeVersionChangeSet, validateVersionChangeSet } from './changes.js'

export const DEFAULT_VERSION_MANIFEST = 'sveltepress.versions.json'
export { computeVersionChangeSet, validateFrozenVersionChangeSets, validateVersionChangeSet } from './changes.js'
export { generateVersionSitemap } from './output.js'
export { createVersionRuntime, resolveVersionContext, resolveVersionedPath, resolveVersionSwitch } from './runtime.js'

export type VersionStatus = 'stable' | 'deprecated' | 'eol'

export interface VersionSearchConfig {
  indexName?: string
  facetFilters?: string[]
  [key: string]: unknown
}

export interface DocumentationVersion {
  id: string
  label: string
  status?: VersionStatus
  message?: string
  sourceRef?: string
  editLink?: false
  noIndex?: boolean
  search?: VersionSearchConfig
  routes?: string[]
  sidebar?: Record<string, VersionNavigationItem[]>
  sharedDependencies?: string[]
  changes?: VersionChangeSet
}

export interface VersionChangeSection {
  id: string
  title: string
  summary?: string
  introducedIn: string
}

export interface VersionChangePage {
  route: string
  title: string
  summary?: string
  sections: VersionChangeSection[]
}

export interface VersionChangeSet {
  versionId: string
  baselineVersionId: string | null
  newPages: VersionChangePage[]
  updatedPages: VersionChangePage[]
}

export interface VersionNavigationItem {
  title?: string
  to?: string
  external?: boolean
  collapsible?: boolean
  items?: VersionNavigationItem[]
}

export interface VersionContentConfig {
  include: string[]
  exclude: string[]
  shared: string[]
}

export interface VersionManifest {
  $schema?: string
  basePath: string
  current: DocumentationVersion
  versions: DocumentationVersion[]
  content: VersionContentConfig
}

export interface VersionContext {
  versionId: string
  version: DocumentationVersion
  logicalPath: string
  historical: boolean
}

export interface VersionSwitchTarget {
  href: string
  fallback: boolean
}

export interface VersionRuntime {
  manifest: VersionManifest | null
  changeSets: Record<string, VersionChangeSet>
  resolveVersionChanges: (versionId?: string) => VersionChangeSet | null
  resolveVersionContext: (pathname: string) => VersionContext | null
  resolveVersionedPath: (to: string, context: VersionContext | null) => string
  resolveVersionSwitch: (pathname: string, targetVersionId: string) => VersionSwitchTarget | null
}

export function validateVersionId(id: string): boolean {
  return /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(id)
}

export function validateVersionManifest(value: unknown): asserts value is VersionManifest {
  const errors: string[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('[sveltepress:versions] Manifest must be a JSON object.')
  }

  const manifest = value as Partial<VersionManifest>
  rejectUnknownKeys(manifest, ['$schema', 'basePath', 'current', 'versions', 'content'], 'manifest', errors)
  if (typeof manifest.basePath !== 'string' || !/^\/[a-z0-9-]+$/.test(manifest.basePath))
    errors.push('basePath must be one lowercase absolute route segment such as "/v".')

  if (!manifest.current || typeof manifest.current !== 'object')
    errors.push('current must describe the unprefixed documentation version.')

  if (!Array.isArray(manifest.versions))
    errors.push('versions must be an ordered array.')

  if (!manifest.content || typeof manifest.content !== 'object') {
    errors.push('content must define include, exclude, and shared arrays.')
  }
  else {
    rejectUnknownKeys(manifest.content, ['include', 'exclude', 'shared'], 'content', errors)
    for (const key of ['include', 'exclude', 'shared'] as const) {
      if (!Array.isArray(manifest.content[key]) || !manifest.content[key].every(item => typeof item === 'string'))
        errors.push(`content.${key} must be an array of strings.`)
    }
  }

  const records = [manifest.current, ...(Array.isArray(manifest.versions) ? manifest.versions : [])].filter(Boolean) as DocumentationVersion[]
  const seen = new Set<string>()
  for (const version of records) {
    if (!version || typeof version !== 'object') {
      errors.push('every version must be an object.')
      continue
    }
    if (typeof version.id !== 'string' || !validateVersionId(version.id))
      errors.push(`version id "${String(version.id)}" is invalid.`)
    else if (seen.has(version.id))
      errors.push(`duplicate version id "${version.id}".`)
    else
      seen.add(version.id)
    if (typeof version.label !== 'string' || !version.label.trim())
      errors.push(`version "${String(version.id)}" must have a non-empty label.`)
    rejectUnknownKeys(version, [
      'id',
      'label',
      'status',
      'message',
      'sourceRef',
      'editLink',
      'noIndex',
      'search',
      'routes',
      'sidebar',
      'sharedDependencies',
    ], `version "${String(version.id)}"`, errors)
    if (version.status && !['stable', 'deprecated', 'eol'].includes(version.status))
      errors.push(`version "${String(version.id)}" has an invalid status.`)
    if (version.message !== undefined && typeof version.message !== 'string')
      errors.push(`version "${String(version.id)}" message must be a string.`)
    if (version.sourceRef !== undefined && typeof version.sourceRef !== 'string')
      errors.push(`version "${String(version.id)}" sourceRef must be a string.`)
    if (version.editLink !== undefined && version.editLink !== false)
      errors.push(`version "${String(version.id)}" editLink must be false when provided.`)
    if (version.noIndex !== undefined && typeof version.noIndex !== 'boolean')
      errors.push(`version "${String(version.id)}" noIndex must be a boolean.`)
    validateSearch(version.search, `version "${String(version.id)}" search`, errors)
    if (version.routes && (!Array.isArray(version.routes) || !version.routes.every(route => typeof route === 'string' && route.startsWith('/'))))
      errors.push(`version "${String(version.id)}" routes must be absolute route strings.`)
    if (version.sidebar !== undefined)
      validateSidebar(version.sidebar, `version "${String(version.id)}" sidebar`, errors)
    if (version.sharedDependencies !== undefined && (!Array.isArray(version.sharedDependencies) || !version.sharedDependencies.every(item => typeof item === 'string')))
      errors.push(`version "${String(version.id)}" sharedDependencies must be an array of strings.`)
  }

  if (errors.length)
    throw new Error(`[sveltepress:versions] Invalid manifest:\n- ${errors.join('\n- ')}`)
}

export function loadVersionManifest(siteRoot = process.cwd(), manifestFile = DEFAULT_VERSION_MANIFEST): VersionManifest | null {
  const manifestPath = resolve(siteRoot, manifestFile)
  if (!existsSync(manifestPath))
    return null

  let manifest: VersionManifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse ${relative(siteRoot, manifestPath)}: ${(error as Error).message}`)
  }
  validateVersionManifest(manifest)

  const routesRoot = join(siteRoot, 'src/routes')
  const baseSegment = manifest.basePath.slice(1)
  manifest.current.routes = normalizeRoutes(manifest.current.routes ?? scanRoutes(routesRoot, join(routesRoot, baseSegment)))
  manifest.versions = manifest.versions.map((version) => {
    const snapshotRoot = join(routesRoot, baseSegment, version.id)
    const metadata = readSnapshotMetadata(snapshotRoot)
    return {
      ...version,
      status: version.status ?? 'stable',
      routes: normalizeRoutes(version.routes ?? metadata?.routes ?? scanRoutes(snapshotRoot)),
      sidebar: version.sidebar ?? metadata?.sidebar,
      sharedDependencies: metadata?.sharedDependencies,
      changes: metadata?.changes,
    }
  })
  const knownVersions = new Set([manifest.current.id, ...manifest.versions.map(version => version.id)])
  for (const version of manifest.versions) {
    if (version.changes)
      validateVersionChangeSet(version.changes, `version "${version.id}" changes`, version.id, knownVersions)
  }
  manifest.current.changes = computeVersionChangeSet(siteRoot, manifest)
  return manifest
}

function scanRoutes(root: string, excludedRoot?: string): string[] {
  if (!existsSync(root))
    return []
  const files: string[] = []
  walk(root, files, excludedRoot)
  return files
    .filter(file => /\+page(?:@[\w-]+)?\.(?:md|svelte)$/.test(file))
    .map((file) => {
      const directory = relative(root, file).split(sep).slice(0, -1).filter(segment => !/^\(.*\)$/.test(segment))
      return normalizeRoute(`/${directory.join('/')}`)
    })
}

function readSnapshotMetadata(snapshotRoot: string): Pick<DocumentationVersion, 'routes' | 'sidebar' | 'sharedDependencies' | 'changes'> | null {
  const path = join(snapshotRoot, '.sveltepress-version.json')
  if (!existsSync(path))
    return null
  try {
    const metadata = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
    const errors: string[] = []
    rejectUnknownKeys(metadata, ['id', 'routes', 'sidebar', 'sharedDependencies', 'changes'], 'snapshot metadata', errors)
    if (typeof metadata.id !== 'string' || !validateVersionId(metadata.id))
      errors.push('snapshot metadata id is invalid.')
    if (!Array.isArray(metadata.routes) || !metadata.routes.every(route => typeof route === 'string' && route.startsWith('/')))
      errors.push('snapshot metadata routes must be absolute route strings.')
    if (metadata.sidebar !== undefined)
      validateSidebar(metadata.sidebar, 'snapshot metadata sidebar', errors)
    if (!Array.isArray(metadata.sharedDependencies) || !metadata.sharedDependencies.every(item => typeof item === 'string'))
      errors.push('snapshot metadata sharedDependencies must be an array of strings.')
    if (metadata.changes !== undefined) {
      try {
        validateVersionChangeSet(metadata.changes, 'snapshot metadata changes')
      }
      catch (error) {
        errors.push((error as Error).message)
      }
    }
    if (errors.length)
      throw new Error(errors.join('\n- '))
    return metadata as Pick<DocumentationVersion, 'routes' | 'sidebar' | 'sharedDependencies' | 'changes'>
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse snapshot metadata for ${snapshotRoot}: ${(error as Error).message}`)
  }
}

function rejectUnknownKeys(value: object, allowed: string[], context: string, errors: string[]) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      errors.push(`${context} has unknown field "${key}".`)
  }
}

function validateSearch(value: unknown, context: string, errors: string[]) {
  if (value === undefined)
    return
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${context} must be an object.`)
    return
  }
  const search = value as VersionSearchConfig
  if (search.indexName !== undefined && typeof search.indexName !== 'string')
    errors.push(`${context}.indexName must be a string.`)
  if (search.facetFilters !== undefined && (!Array.isArray(search.facetFilters) || !search.facetFilters.every(item => typeof item === 'string')))
    errors.push(`${context}.facetFilters must be an array of strings.`)
}

function validateSidebar(value: unknown, context: string, errors: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${context} must be an object of navigation arrays.`)
    return
  }
  for (const [route, items] of Object.entries(value)) {
    if (!route.startsWith('/'))
      errors.push(`${context} key "${route}" must be an absolute route.`)
    if (!Array.isArray(items)) {
      errors.push(`${context}.${route} must be an array.`)
      continue
    }
    items.forEach((item, index) => validateNavigationItem(item, `${context}.${route}[${index}]`, errors))
  }
}

function validateNavigationItem(value: unknown, context: string, errors: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${context} must be an object.`)
    return
  }
  const item = value as VersionNavigationItem
  rejectUnknownKeys(item, ['title', 'to', 'external', 'collapsible', 'items'], context, errors)
  if (item.title !== undefined && typeof item.title !== 'string')
    errors.push(`${context}.title must be a string.`)
  if (item.to !== undefined && typeof item.to !== 'string')
    errors.push(`${context}.to must be a string.`)
  if (item.external !== undefined && typeof item.external !== 'boolean')
    errors.push(`${context}.external must be a boolean.`)
  if (item.collapsible !== undefined && typeof item.collapsible !== 'boolean')
    errors.push(`${context}.collapsible must be a boolean.`)
  if (item.items !== undefined) {
    if (!Array.isArray(item.items))
      errors.push(`${context}.items must be an array.`)
    else
      item.items.forEach((child, index) => validateNavigationItem(child, `${context}.items[${index}]`, errors))
  }
}

function walk(directory: string, files: string[], excludedRoot?: string) {
  if (excludedRoot && resolve(directory) === resolve(excludedRoot))
    return
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory())
      walk(path, files, excludedRoot)
    else if (entry.isFile())
      files.push(path)
  }
}

function normalizeRoutes(routes: string[]): string[] {
  return [...new Set(routes.map(normalizeRoute))].sort()
}

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}
