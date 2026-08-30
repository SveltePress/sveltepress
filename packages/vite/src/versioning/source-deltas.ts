import type { VersionArtifactManifest } from './artifacts.js'
import type { DocumentationVersion } from './index.js'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

export const VERSION_SOURCE_DELTA_SCHEMA = 2

export interface VersionSourceDeltaPage {
  route: string
  files: string[]
}

export interface VersionSourceDeltaManifest {
  schemaVersion: number
  siteId: string
  versionId: string
  parentVersionId: string | null
  metadataHash: string
  pages: VersionSourceDeltaPage[]
  removedRoutes: string[]
}

export function versionSourceHash(
  pages: Iterable<{ route: string, inputHash: string }>,
): string {
  const inventory = [...pages]
    .map(page => ({ route: page.route, inputHash: page.inputHash }))
    .sort((left, right) => left.route.localeCompare(right.route))
  return createHash('sha256').update(JSON.stringify(inventory)).digest('hex')
}

export function versionMetadataHash(version: DocumentationVersion): string {
  const metadata = {
    id: version.id,
    label: version.label,
    status: version.status,
    message: version.message,
    sourceRef: version.sourceRef,
    editLink: version.editLink,
    noIndex: version.noIndex,
    search: version.search,
    routes: version.routes,
    sidebar: version.sidebar,
    sharedDependencies: version.sharedDependencies,
    changes: version.changes,
  }
  return createHash('sha256').update(stableStringify(metadata)).digest('hex')
}

export function writeVersionSourceDelta(input: {
  siteRoot: string
  sourceRoot: string
  sourceRoutesDirectory: string
  manifest: VersionArtifactManifest
  previous?: VersionArtifactManifest | null
  metadata: DocumentationVersion
}): VersionSourceDeltaManifest {
  const changedPages = Object.values(input.manifest.pages)
    .filter(page => input.previous?.pages[page.route]?.inputHash !== page.inputHash)
    .sort((left, right) => left.route.localeCompare(right.route))
  const delta: VersionSourceDeltaManifest = {
    schemaVersion: VERSION_SOURCE_DELTA_SCHEMA,
    siteId: input.manifest.siteId,
    versionId: input.manifest.versionId,
    parentVersionId: input.previous?.versionId ?? null,
    metadataHash: versionMetadataHash(input.metadata),
    pages: changedPages.map(page => ({
      route: page.route,
      files: [...new Set([...page.files, ...page.dependencies].map(file =>
        canonicalSourcePath(input.siteRoot, input.sourceRoutesDirectory, file),
      ))].sort(),
    })),
    removedRoutes: [...input.manifest.removedRoutes].sort(),
  }
  const target = join(resolve(input.sourceRoot), safeSegment(delta.versionId))
  if (existsSync(target)) {
    const existing = readVersionSourceDelta(input.sourceRoot, delta.versionId)
    if (JSON.stringify(existing) === JSON.stringify(delta))
      return delta
    throw new Error(`[sveltepress:versions] Source delta ${delta.versionId} already exists with different content.`)
  }
  mkdirSync(dirname(target), { recursive: true })
  const staging = join(dirname(target), `.sveltepress-delta-${delta.versionId}-${randomUUID()}`)
  try {
    mkdirSync(staging)
    for (const page of changedPages) {
      for (const original of [...new Set([...page.files, ...page.dependencies])]) {
        const source = resolve(input.siteRoot, original)
        const canonical = canonicalSourcePath(input.siteRoot, input.sourceRoutesDirectory, original)
        const destination = join(staging, 'files', canonical)
        mkdirSync(dirname(destination), { recursive: true })
        const content = readFileSync(source)
        if (existsSync(destination)) {
          if (!readFileSync(destination).equals(content))
            throw new Error(`[sveltepress:versions] Conflicting source content for ${canonical}.`)
          continue
        }
        writeFileSync(destination, content, { flag: 'wx' })
      }
    }
    writeFileSync(join(staging, 'delta.json'), `${JSON.stringify(delta, null, 2)}\n`, { flag: 'wx' })
    renameSync(staging, target)
  }
  finally {
    if (existsSync(staging))
      rmSync(staging, { recursive: true, force: true })
  }
  return delta
}

export function readVersionSourceDelta(sourceRoot: string, versionId: string): VersionSourceDeltaManifest {
  const path = join(resolve(sourceRoot), safeSegment(versionId), 'delta.json')
  if (!existsSync(path))
    throw new Error(`[sveltepress:versions] Missing source delta for ${versionId}: ${path}`)
  const delta = JSON.parse(readFileSync(path, 'utf8')) as VersionSourceDeltaManifest
  validateVersionSourceDelta(delta, versionId)
  return delta
}

export function removeVersionSourceDelta(sourceRoot: string, versionId: string): void {
  rmSync(join(resolve(sourceRoot), safeSegment(versionId)), { recursive: true, force: true })
}

export function materializeVersionSourceDeltas(input: {
  sourceRoot: string
  versionIds: string[]
  outputDirectory: string
}): void {
  const output = resolve(input.outputDirectory)
  rmSync(output, { recursive: true, force: true })
  mkdirSync(output, { recursive: true })
  let previous: string | null = null
  for (const versionId of input.versionIds) {
    const delta = readVersionSourceDelta(input.sourceRoot, versionId)
    if (delta.parentVersionId !== previous)
      throw new Error(`[sveltepress:versions] Source delta ${versionId} expects parent ${delta.parentVersionId ?? 'none'}, not ${previous ?? 'none'}.`)
    for (const route of delta.removedRoutes)
      removeRoutePage(output, route)
    copyTree(join(resolve(input.sourceRoot), safeSegment(versionId), 'files'), output)
    previous = versionId
  }
}

export function validateVersionSourceDelta(delta: VersionSourceDeltaManifest, expectedVersionId?: string): void {
  const errors: string[] = []
  if (delta.schemaVersion !== VERSION_SOURCE_DELTA_SCHEMA)
    errors.push(`schemaVersion must be ${VERSION_SOURCE_DELTA_SCHEMA}`)
  if (!delta.siteId || typeof delta.siteId !== 'string')
    errors.push('siteId is required')
  if (!delta.versionId || typeof delta.versionId !== 'string' || (expectedVersionId && delta.versionId !== expectedVersionId))
    errors.push('versionId is invalid')
  if (typeof delta.metadataHash !== 'string' || !/^[a-f0-9]{64}$/.test(delta.metadataHash))
    errors.push('metadataHash must be a SHA-256 hash')
  if (!Array.isArray(delta.pages) || !delta.pages.every(page => page.route.startsWith('/') && Array.isArray(page.files)))
    errors.push('pages must contain absolute routes and file lists')
  if (!Array.isArray(delta.removedRoutes) || !delta.removedRoutes.every(route => route.startsWith('/')))
    errors.push('removedRoutes must contain absolute routes')
  if (errors.length)
    throw new Error(`[sveltepress:versions] Invalid source delta:\n- ${errors.join('\n- ')}`)
}

function canonicalSourcePath(siteRoot: string, sourceRoutesDirectory: string, file: string): string {
  const absolute = resolve(siteRoot, file)
  const routesRoot = resolve(sourceRoutesDirectory)
  const withinRoutes = relative(routesRoot, absolute)
  if (withinRoutes && !withinRoutes.startsWith(`..${sep}`) && withinRoutes !== '..')
    return join('src/routes', withinRoutes).split(sep).join('/')
  const siteRelative = relative(resolve(siteRoot), absolute).split(sep).join('/')
  if (!siteRelative || siteRelative.startsWith('../'))
    throw new Error(`[sveltepress:versions] Cannot store source outside the site root: ${file}`)
  return siteRelative
}

function removeRoutePage(root: string, route: string) {
  const directory = join(root, 'src/routes', ...route.split('/').filter(Boolean))
  if (!existsSync(directory))
    return
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && /^\+page(?:@[\w-]+)?\.(?:md|svelte|[cm]?[jt]s)$/.test(entry.name))
      rmSync(join(directory, entry.name), { force: true })
  }
}

function copyTree(source: string, destination: string) {
  if (!existsSync(source))
    return
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name)
    const to = join(destination, entry.name)
    if (entry.isDirectory()) {
      mkdirSync(to, { recursive: true })
      copyTree(from, to)
    }
    else if (entry.isFile()) {
      mkdirSync(dirname(to), { recursive: true })
      writeFileSync(to, readFileSync(from))
    }
  }
}

function safeSegment(value: string): string {
  if (!/^[a-z0-9][\w.-]*$/i.test(value) || value === '.' || value === '..')
    throw new Error(`[sveltepress:versions] Unsafe version source segment: ${value}`)
  return value
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value))
    return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record)
      .filter(key => record[key] !== undefined)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
