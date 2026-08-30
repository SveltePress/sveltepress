import type { VersionArtifactManifest } from './artifacts.js'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { validateVersionArtifactManifest } from './artifacts.js'
import { createArtifactPageWrapper, readPageArtifactMetadata } from './page-artifact-module.js'

export interface VersionShellRoutesReport {
  currentRoutes: number
  historicalRoutes: number
  copiedSupportFiles: number
}

export async function generateVersionShellRoutes(input: {
  siteRoot: string
  storeRoot: string
  outputDirectory: string
  basePath: string
  pageLayout: string
  current: VersionArtifactManifest
  historical: VersionArtifactManifest[]
}): Promise<VersionShellRoutesReport> {
  validateVersionArtifactManifest(input.current)
  for (const manifest of input.historical) {
    validateVersionArtifactManifest(manifest)
    if (manifest.siteId !== input.current.siteId)
      throw new Error(`[sveltepress:versions] Historical artifact ${manifest.versionId} belongs to a different site.`)
  }
  const sourceRoutes = resolve(input.siteRoot, 'src/routes')
  const outputDirectory = resolve(input.outputDirectory)
  const parentDirectory = dirname(outputDirectory)
  const staging = join(parentDirectory, `.sveltepress-shell-${basename(outputDirectory)}-${randomUUID()}`)
  const backup = join(parentDirectory, `.sveltepress-shell-backup-${basename(outputDirectory)}-${randomUUID()}`)
  const versionBaseSegment = normalizeBasePath(input.basePath)
  let movedExisting = false
  let copiedSupportFiles = 0
  let historicalRoutes = 0
  try {
    mkdirSync(staging, { recursive: true })
    copiedSupportFiles = copyRouteSupportFiles(sourceRoutes, staging, versionBaseSegment)
    await writeManifestWrappers({
      destinationRoot: staging,
      routePrefix: [],
      manifest: input.current,
      storeRoot: input.storeRoot,
      pageLayout: input.pageLayout,
    })
    for (const historical of input.historical) {
      await writeManifestWrappers({
        destinationRoot: staging,
        routePrefix: [versionBaseSegment, safeSegment(historical.versionId)],
        manifest: historical,
        storeRoot: input.storeRoot,
        pageLayout: input.pageLayout,
      })
      historicalRoutes += Object.keys(historical.pages).length
    }
    mkdirSync(parentDirectory, { recursive: true })
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
  return {
    currentRoutes: Object.keys(input.current.pages).length,
    historicalRoutes,
    copiedSupportFiles,
  }
}

async function writeManifestWrappers(input: {
  destinationRoot: string
  routePrefix: string[]
  manifest: VersionArtifactManifest
  storeRoot: string
  pageLayout: string
}) {
  for (const page of Object.values(input.manifest.pages)) {
    const metadata = await readPageArtifactMetadata(input.storeRoot, page.artifactHash)
    if (metadata.route !== page.route)
      throw new Error(`[sveltepress:versions] Artifact ${page.artifactHash} cannot serve ${page.route}.`)
    const routeSegments = routeSegmentsFromPath(page.route)
    const destination = join(input.destinationRoot, ...input.routePrefix, ...routeSegments, '+page.svelte')
    if (existsSync(destination))
      throw new Error(`[sveltepress:versions] Generated shell route collision at ${relative(input.destinationRoot, destination).split(sep).join('/')}.`)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, createArtifactPageWrapper({
      artifactHash: page.artifactHash,
      fm: metadata.fm,
      pageLayout: input.pageLayout,
    }), { flag: 'wx' })
  }
}

function copyRouteSupportFiles(sourceRoot: string, destinationRoot: string, excludedSegment: string): number {
  if (!existsSync(sourceRoot))
    throw new Error(`[sveltepress:versions] Routes directory does not exist: ${sourceRoot}`)
  let copied = 0
  const visit = (sourceDirectory: string) => {
    for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
      const source = join(sourceDirectory, entry.name)
      const routeRelative = relative(sourceRoot, source)
      if (routeRelative === excludedSegment || routeRelative.startsWith(`${excludedSegment}${sep}`))
        continue
      if (entry.isSymbolicLink())
        throw new Error(`[sveltepress:versions] Shell routes cannot contain symbolic links: ${routeRelative}`)
      if (entry.isDirectory()) {
        visit(source)
        continue
      }
      if (!entry.isFile() || /^\+page(?:@[\w-]+)?\.(?:md|svelte)$/.test(entry.name))
        continue
      const destination = join(destinationRoot, routeRelative)
      mkdirSync(dirname(destination), { recursive: true })
      writeFileSync(destination, readFileSync(source), { flag: 'wx' })
      copied += 1
    }
  }
  visit(sourceRoot)
  return copied
}

function routeSegmentsFromPath(route: string): string[] {
  if (!route.startsWith('/'))
    throw new Error(`[sveltepress:versions] Artifact route must be absolute: ${route}`)
  const segments = route.split('/').filter(Boolean)
  if (segments.some(segment => segment === '.' || segment === '..' || segment.includes(sep)))
    throw new Error(`[sveltepress:versions] Unsafe artifact route: ${route}`)
  return segments
}

function normalizeBasePath(basePath: string): string {
  const segments = basePath.split('/').filter(Boolean)
  if (segments.length !== 1)
    throw new Error(`[sveltepress:versions] Version base path must contain one segment: ${basePath}`)
  return safeSegment(segments[0])
}

function safeSegment(value: string): string {
  if (!/^[a-z0-9][\w.-]*$/i.test(value) || value === '.' || value === '..')
    throw new Error(`[sveltepress:versions] Unsafe route segment: ${value}`)
  return value
}
