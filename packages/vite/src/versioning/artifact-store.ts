import type {
  PageArtifactInput,
  PageArtifactRecord,
  VersionArtifactManifest,
  VersionBuildPlan,
} from './artifacts.js'
import { Buffer } from 'node:buffer'
import { createHash, randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path'
import {
  artifactManifestHash,
  createVersionArtifactManifest,
  validateVersionArtifactManifest,
} from './artifacts.js'

const PAGE_ARTIFACT_SCHEMA = 1

export interface CompiledPageArtifact {
  files: Record<string, string | Uint8Array>
}

export interface StoredPageArtifactFile {
  path: string
  hash: string
  size: number
}

export interface StoredPageArtifact {
  schemaVersion: number
  route: string
  files: StoredPageArtifactFile[]
}

export interface VersionBuildReport {
  siteId: string
  versionId: string
  compiledPages: number
  reusedPages: number
  removedRoutes: number
  recomposedPages: number
  fullRebuild: boolean
  invalidationReasons: string[]
}

export async function writePageArtifact(
  storeRoot: string,
  artifact: { route: string, files: Record<string, string | Uint8Array> },
): Promise<string> {
  const entries = Object.entries(artifact.files)
    .map(([path, value]) => {
      const normalized = normalizeArtifactPath(path)
      const content = typeof value === 'string' ? Buffer.from(value) : Buffer.from(value)
      return { path: normalized, content, hash: sha256(content), size: content.byteLength }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
  if (!entries.length)
    throw new Error(`[sveltepress:versions] Page artifact for ${artifact.route} contains no files.`)
  const duplicate = entries.find((entry, index) => entries[index - 1]?.path === entry.path)
  if (duplicate)
    throw new Error(`[sveltepress:versions] Page artifact contains duplicate file ${duplicate.path}.`)

  const descriptor: StoredPageArtifact = {
    schemaVersion: PAGE_ARTIFACT_SCHEMA,
    route: artifact.route,
    files: entries.map(({ path, hash, size }) => ({ path, hash, size })),
  }
  const artifactHash = sha256(Buffer.from(stableStringify(descriptor)))
  const blobsRoot = join(storeRoot, 'blobs')
  const target = join(blobsRoot, artifactHash)
  if (existsSync(target)) {
    try {
      await validateStoredPageArtifact(storeRoot, artifactHash)
      return artifactHash
    }
    catch {
      rmSync(target, { recursive: true, force: true })
    }
  }

  mkdirSync(blobsRoot, { recursive: true })
  const staging = join(blobsRoot, `.sveltepress-${artifactHash}-${randomUUID()}`)
  try {
    mkdirSync(staging)
    for (const entry of entries) {
      const destination = join(staging, entry.path)
      mkdirSync(dirname(destination), { recursive: true })
      writeFileSync(destination, entry.content, { flag: 'wx' })
    }
    writeFileSync(join(staging, 'page-artifact.json'), `${JSON.stringify(descriptor, null, 2)}\n`, { flag: 'wx' })
    renameSync(staging, target)
  }
  finally {
    if (existsSync(staging))
      rmSync(staging, { recursive: true, force: true })
  }
  return artifactHash
}

export async function validateStoredPageArtifact(
  storeRoot: string,
  artifactHash: string,
): Promise<StoredPageArtifact> {
  const directory = join(storeRoot, 'blobs', artifactHash)
  const descriptorPath = join(directory, 'page-artifact.json')
  if (!existsSync(descriptorPath))
    throw new Error(`[sveltepress:versions] Missing page artifact ${artifactHash}.`)
  let descriptor: StoredPageArtifact
  try {
    descriptor = JSON.parse(readFileSync(descriptorPath, 'utf8'))
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse page artifact ${artifactHash}: ${(error as Error).message}`)
  }
  if (descriptor.schemaVersion !== PAGE_ARTIFACT_SCHEMA || typeof descriptor.route !== 'string' || !Array.isArray(descriptor.files))
    throw new Error(`[sveltepress:versions] Invalid page artifact descriptor ${artifactHash}.`)
  const expectedArtifactHash = sha256(Buffer.from(stableStringify(descriptor)))
  if (expectedArtifactHash !== artifactHash)
    throw new Error(`[sveltepress:versions] Page artifact descriptor hash does not match ${artifactHash}.`)
  for (const file of descriptor.files) {
    const normalized = normalizeArtifactPath(file.path)
    const path = join(directory, normalized)
    if (!existsSync(path) || !statSync(path).isFile())
      throw new Error(`[sveltepress:versions] Missing file ${normalized} in page artifact ${artifactHash}.`)
    const content = readFileSync(path)
    if (sha256(content) !== file.hash || content.byteLength !== file.size)
      throw new Error(`[sveltepress:versions] File hash does not match for ${normalized} in page artifact ${artifactHash}.`)
  }
  return descriptor
}

export async function writeVersionArtifactManifest(
  storeRoot: string,
  manifest: VersionArtifactManifest,
): Promise<void> {
  validateVersionArtifactManifest(manifest)
  const path = versionManifestPath(storeRoot, manifest.siteId, manifest.versionId)
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`
  if (existsSync(path)) {
    if (readFileSync(path, 'utf8') === serialized)
      return
    throw new Error(
      `[sveltepress:versions] Version artifact manifest ${manifest.siteId}/${manifest.versionId} already exists with different content.`,
    )
  }
  writeFileAtomic(path, serialized)
}

export function removeVersionArtifactManifest(
  storeRoot: string,
  siteId: string,
  versionId: string,
): void {
  rmSync(versionManifestPath(storeRoot, siteId, versionId), { force: true })
}

export function readVersionArtifactManifest(
  storeRoot: string,
  siteId: string,
  versionId: string,
): VersionArtifactManifest | null {
  const path = versionManifestPath(storeRoot, siteId, versionId)
  if (!existsSync(path))
    return null
  let manifest: VersionArtifactManifest
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'))
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse version artifact manifest ${siteId}/${versionId}: ${(error as Error).message}`)
  }
  validateVersionArtifactManifest(manifest)
  return manifest
}

export function readDraftVersionArtifactManifest(
  storeRoot: string,
  siteId: string,
): VersionArtifactManifest | null {
  const path = draftManifestPath(storeRoot, siteId)
  if (!existsSync(path))
    return null
  let manifest: VersionArtifactManifest
  try {
    manifest = JSON.parse(readFileSync(path, 'utf8'))
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse draft artifact manifest ${siteId}: ${(error as Error).message}`)
  }
  validateVersionArtifactManifest(manifest)
  return manifest
}

export function writeDraftVersionArtifactManifest(
  storeRoot: string,
  manifest: VersionArtifactManifest,
): void {
  validateVersionArtifactManifest(manifest)
  writeFileReplaceAtomic(
    draftManifestPath(storeRoot, manifest.siteId),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
}

export async function publishDraftVersionArtifactManifest(input: {
  storeRoot: string
  siteId: string
  versionId: string
  previous?: VersionArtifactManifest | null
}): Promise<VersionArtifactManifest> {
  const draft = readDraftVersionArtifactManifest(input.storeRoot, input.siteId)
  if (!draft || draft.versionId !== input.versionId)
    throw new Error(`[sveltepress:versions] No built draft exists for ${input.siteId}/${input.versionId}.`)
  const parent = input.previous
    ? { versionId: input.previous.versionId, manifestHash: artifactManifestHash(input.previous) }
    : null
  const published = createVersionArtifactManifest({
    siteId: draft.siteId,
    versionId: draft.versionId,
    parent,
    fingerprints: draft.fingerprints,
    pages: Object.values(draft.pages),
    removedRoutes: draft.removedRoutes,
    lineage: input.previous ? [...input.previous.lineage, parent!] : [],
  })
  if (input.previous)
    validateVersionArtifactManifest(published, input.previous)
  await writeVersionArtifactManifest(input.storeRoot, published)
  return published
}

export async function buildInitialVersionArtifacts(input: {
  storeRoot: string
  siteId: string
  versionId: string
  pages: PageArtifactInput[]
  fingerprints: VersionArtifactManifest['fingerprints']
  compile: (page: PageArtifactInput) => Promise<CompiledPageArtifact>
  persist?: boolean
}): Promise<{ manifest: VersionArtifactManifest, report: VersionBuildReport }> {
  const records: PageArtifactRecord[] = []
  for (const page of [...input.pages].sort((left, right) => left.route.localeCompare(right.route))) {
    const compiled = await input.compile(page)
    const artifactHash = await writePageArtifact(input.storeRoot, {
      route: page.route,
      files: compiled.files,
    })
    records.push({ ...page, artifactHash })
  }
  const manifest = createVersionArtifactManifest({
    siteId: input.siteId,
    versionId: input.versionId,
    parent: null,
    fingerprints: input.fingerprints,
    pages: records,
    removedRoutes: [],
  })
  validateVersionArtifactManifest(manifest)
  if (input.persist !== false)
    await writeVersionArtifactManifest(input.storeRoot, manifest)
  return {
    manifest,
    report: {
      siteId: input.siteId,
      versionId: input.versionId,
      compiledPages: records.length,
      reusedPages: 0,
      removedRoutes: 0,
      recomposedPages: records.length,
      fullRebuild: true,
      invalidationReasons: ['initial artifact baseline'],
    },
  }
}

export async function buildVersionArtifacts(input: {
  storeRoot: string
  previous: VersionArtifactManifest
  plan: VersionBuildPlan
  compile: (page: PageArtifactInput) => Promise<CompiledPageArtifact>
  persist?: boolean
}): Promise<{ manifest: VersionArtifactManifest, report: VersionBuildReport }> {
  validateVersionArtifactManifest(input.previous)
  if (input.plan.parent.versionId !== input.previous.versionId
    || input.plan.parent.manifestHash !== artifactManifestHash(input.previous)) {
    throw new Error('[sveltepress:versions] Build plan parent does not match the previous manifest.')
  }

  const compileRoutes = new Set(input.plan.compiledRoutes)
  const records: PageArtifactRecord[] = []
  for (const page of input.plan.pages) {
    if (compileRoutes.has(page.route)) {
      const compiled = await input.compile(page)
      const artifactHash = await writePageArtifact(input.storeRoot, {
        route: page.route,
        files: compiled.files,
      })
      records.push({ ...page, artifactHash })
      continue
    }
    const previous = input.previous.pages[page.route]
    if (!previous)
      throw new Error(`[sveltepress:versions] Build plan attempted to reuse missing route ${page.route}.`)
    await validateStoredPageArtifact(input.storeRoot, previous.artifactHash)
    records.push({ ...page, artifactHash: previous.artifactHash })
  }

  const parent = {
    versionId: input.previous.versionId,
    manifestHash: artifactManifestHash(input.previous),
  }
  const manifest = createVersionArtifactManifest({
    siteId: input.plan.siteId,
    versionId: input.plan.versionId,
    parent,
    fingerprints: input.plan.fingerprints,
    pages: records,
    removedRoutes: input.plan.removedRoutes,
    lineage: [...input.previous.lineage, parent],
  })
  validateVersionArtifactManifest(manifest, input.previous)
  if (input.persist !== false)
    await writeVersionArtifactManifest(input.storeRoot, manifest)
  return {
    manifest,
    report: {
      siteId: input.plan.siteId,
      versionId: input.plan.versionId,
      compiledPages: input.plan.compiledRoutes.length,
      reusedPages: input.plan.reusedRoutes.length,
      removedRoutes: input.plan.removedRoutes.length,
      recomposedPages: input.plan.recomposedRoutes.length,
      fullRebuild: input.plan.fullRebuild,
      invalidationReasons: [...input.plan.invalidationReasons],
    },
  }
}

export async function composeVersionArtifacts(input: {
  storeRoot: string
  manifest: VersionArtifactManifest
  outputDirectory: string
  composeHtml?: (input: { route: string, path: string, html: string }) => string | Promise<string>
}): Promise<void> {
  validateVersionArtifactManifest(input.manifest)
  const outputDirectory = resolve(input.outputDirectory)
  const parentDirectory = dirname(outputDirectory)
  mkdirSync(parentDirectory, { recursive: true })
  const staging = join(parentDirectory, `.sveltepress-compose-${basename(outputDirectory)}-${randomUUID()}`)
  const backup = join(parentDirectory, `.sveltepress-backup-${basename(outputDirectory)}-${randomUUID()}`)
  let movedExisting = false
  try {
    mkdirSync(staging)
    for (const page of Object.values(input.manifest.pages)) {
      const descriptor = await validateStoredPageArtifact(input.storeRoot, page.artifactHash)
      if (descriptor.route !== page.route)
        throw new Error(`[sveltepress:versions] Page artifact ${page.artifactHash} belongs to ${descriptor.route}, not ${page.route}.`)
      const artifactDirectory = join(input.storeRoot, 'blobs', page.artifactHash)
      for (const file of descriptor.files) {
        const source = join(artifactDirectory, file.path)
        const destination = join(staging, file.path)
        let content = readFileSync(source)
        if (input.composeHtml && file.path.endsWith('.html')) {
          content = Buffer.from(await input.composeHtml({
            route: page.route,
            path: file.path,
            html: content.toString('utf8'),
          }))
        }
        if (existsSync(destination)) {
          if (sha256(readFileSync(destination)) !== sha256(content))
            throw new Error(`[sveltepress:versions] Conflicting composed output ${file.path}.`)
          continue
        }
        mkdirSync(dirname(destination), { recursive: true })
        writeFileSync(destination, content, { flag: 'wx' })
      }
    }
    if (existsSync(outputDirectory)) {
      renameSync(outputDirectory, backup)
      movedExisting = true
    }
    renameSync(staging, outputDirectory)
    if (movedExisting)
      rmSync(backup, { recursive: true, force: true })
  }
  catch (error) {
    if (existsSync(staging))
      rmSync(staging, { recursive: true, force: true })
    if (movedExisting && !existsSync(outputDirectory) && existsSync(backup))
      renameSync(backup, outputDirectory)
    throw error
  }
  finally {
    if (existsSync(staging))
      rmSync(staging, { recursive: true, force: true })
    if (existsSync(backup))
      rmSync(backup, { recursive: true, force: true })
  }
}

function versionManifestPath(storeRoot: string, siteId: string, versionId: string): string {
  return join(storeRoot, 'manifests', safeSegment(siteId, 'siteId'), `${safeSegment(versionId, 'versionId')}.json`)
}

function draftManifestPath(storeRoot: string, siteId: string): string {
  return join(storeRoot, 'drafts', `${safeSegment(siteId, 'siteId')}.json`)
}

function safeSegment(value: string, label: string): string {
  if (!/^[a-z0-9][\w.-]*$/i.test(value) || value === '.' || value === '..')
    throw new Error(`[sveltepress:versions] ${label} must be a safe path segment.`)
  return value
}

function normalizeArtifactPath(path: string): string {
  const normalized = path.split(sep).join('/').replace(/^\.\//, '')
  if (!normalized || isAbsolute(path) || normalized.startsWith('/') || normalized.split('/').includes('..'))
    throw new Error(`[sveltepress:versions] Unsafe page artifact path ${path}.`)
  return normalized
}

function writeFileAtomic(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`)
  try {
    writeFileSync(temporary, content, { flag: 'wx' })
    renameSync(temporary, path)
  }
  finally {
    if (existsSync(temporary))
      rmSync(temporary, { force: true })
  }
}

function writeFileReplaceAtomic(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`)
  try {
    writeFileSync(temporary, content, { flag: 'wx' })
    renameSync(temporary, path)
  }
  finally {
    if (existsSync(temporary))
      rmSync(temporary, { force: true })
  }
}

function sha256(value: Buffer): string {
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
