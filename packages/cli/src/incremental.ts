import type {
  CompiledPageArtifact,
  DocumentationVersion,
  PageArtifactInput,
  VersionArtifactFingerprints,
  VersionArtifactManifest,
  VersionManifest,
} from '@sveltepress/vite/versioning'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import {
  artifactManifestHash,
  buildInitialVersionArtifacts,
  buildVersionArtifacts,
  collectPageArtifactInputs,
  generateVersionShellRoutes,
  loadVersionManifest,
  materializeVersionSourceDeltas,
  PAGE_ARTIFACT_MODULE_SCHEMA,
  planVersionBuild,
  publishDraftVersionArtifactManifest,
  readDraftVersionArtifactManifest,
  readVersionArtifactManifest,
  readVersionSourceDelta,
  removeVersionArtifactManifest,
  removeVersionSourceDelta,
  validateStoredPageArtifact,
  validateVersionArtifactManifest,
  versionMetadataHash,
  versionSourceHash,
  writeDraftVersionArtifactManifest,
  writeVersionSourceDelta,
} from '@sveltepress/vite/versioning'

export interface IncrementalCliIO {
  cwd: string
  stdout: (value: string) => void
  resolveSidebar?: (cwd: string) => Promise<unknown>
  compilePage?: (
    filename: string,
    source: string,
    options: { routesDirectory: string, siteRoot: string },
  ) => Promise<CompiledPageArtifact>
  runBuild?: (input: {
    cwd: string
    routesDirectory: string
    storeRoot: string
    siteId: string
  }) => Promise<void>
}

export interface IncrementalOptions {
  positional: string[]
  siteId?: string
  store?: string
  output?: string
  dryRun: boolean
  draftOnly?: boolean
}

export function resolveArtifactStore(siteRoot: string, manifest: VersionManifest): string {
  return resolve(siteRoot, manifest.artifacts?.store ?? '.sveltepress/version-artifacts')
}

export function resolveVersionSources(siteRoot: string, manifest: VersionManifest): string {
  return resolve(siteRoot, manifest.artifacts?.sources ?? 'version-deltas')
}

export async function planIncrementalBuild(
  io: IncrementalCliIO,
  manifest: VersionManifest,
): Promise<{ previous: VersionArtifactManifest | null, plan: ReturnType<typeof planVersionBuild> | null, pages: PageArtifactInput[], fingerprints: VersionArtifactFingerprints }> {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const ctx = localeContext(io, manifest)
  const pages = collectPageArtifactInputs(io.cwd, {
    basePath: ctx.basePath,
    routesDir: ctx.routesDir,
    excludeDirs: siblingLocaleDirs(io, ctx.localeDir),
  })
  const fingerprints = resolveFingerprints(io.cwd, manifest)
  const draft = readDraftVersionArtifactManifest(storeRoot, config.siteId)
  const latestFrozen = manifest.versions[0]
    ? readVersionArtifactManifest(storeRoot, config.siteId, manifest.versions[0].id)
    : null
  const previous = draft?.versionId === manifest.current.id ? draft : latestFrozen
  const plan = previous
    ? planVersionBuild({
        siteId: config.siteId,
        versionId: manifest.current.id,
        previous,
        pages,
        fingerprints,
      })
    : null
  return { previous, plan, pages, fingerprints }
}

export async function printIncrementalPlan(
  io: IncrementalCliIO,
  manifest: VersionManifest,
) {
  const { plan, pages } = await planIncrementalBuild(io, manifest)
  const summary = plan
    ? {
        siteId: plan.siteId,
        versionId: plan.versionId,
        compiledPages: plan.compiledRoutes.length,
        reusedPages: plan.reusedRoutes.length,
        removedRoutes: plan.removedRoutes,
        recomposedPages: plan.recomposedRoutes.length,
        fullRebuild: plan.fullRebuild,
        invalidationReasons: plan.invalidationReasons,
        compiledRoutes: plan.compiledRoutes,
      }
    : {
        siteId: manifest.artifacts!.siteId,
        versionId: manifest.current.id,
        compiledPages: pages.length,
        reusedPages: 0,
        removedRoutes: [],
        recomposedPages: pages.length,
        fullRebuild: true,
        invalidationReasons: ['initial artifact baseline'],
        compiledRoutes: pages.map(page => page.route),
      }
  io.stdout(JSON.stringify(summary, null, 2))
}

export async function buildIncrementalSite(
  io: IncrementalCliIO,
  manifest: VersionManifest,
  options: IncrementalOptions,
) {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const compile = await resolvePageCompiler(io)
  await ensureHistoricalArtifacts(io, manifest, compile)
  const { previous, plan, pages, fingerprints } = await planIncrementalBuild(io, manifest)
  const compileInput = (page: PageArtifactInput) => compileArtifactPage(io.cwd, page, localeContext(io, manifest).sourceRoutesDirectory, compile)
  const result = previous && plan
    ? await buildVersionArtifacts({ storeRoot, previous, plan, compile: compileInput, persist: false })
    : await buildInitialVersionArtifacts({
        storeRoot,
        siteId: config.siteId,
        versionId: manifest.current.id,
        pages,
        fingerprints,
        compile: compileInput,
        persist: false,
      })
  writeDraftVersionArtifactManifest(storeRoot, result.manifest)
  io.stdout(JSON.stringify(result.report, null, 2))
  if (options.draftOnly)
    return
  const discoveredLocales = discoverLocaleManifests(io)
  const isLocaleScopedBuild = discoveredLocales.some(locale => locale.manifest.basePath === manifest.basePath)
  if (!isLocaleScopedBuild) {
    for (const locale of discoveredLocales) {
      if (locale.manifest.basePath === manifest.basePath)
        continue
      await buildIncrementalSite(io, locale.manifest, { ...options, draftOnly: true })
    }
  }
  await composeIncrementalSite(io, manifest, options)
}

export async function composeIncrementalSite(
  io: IncrementalCliIO,
  manifest: VersionManifest,
  _options: IncrementalOptions,
) {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const current = readDraftVersionArtifactManifest(storeRoot, config.siteId)
  if (!current || current.versionId !== manifest.current.id)
    throw new Error(`No built artifact draft exists for current version ${manifest.current.id}. Run \`sveltepress versions build\` first.`)
  const historical = manifest.versions.map((version) => {
    const artifact = readVersionArtifactManifest(storeRoot, config.siteId, version.id)
    if (!artifact)
      throw new Error(`Missing published artifact manifest for ${version.id}.`)
    return artifact
  })
  const routesDirectory = join(io.cwd, '.sveltepress/version-shell-routes')
  const pageLayout = await resolvePageLayout(io)
  const report = await generateVersionShellRoutes({
    siteRoot: io.cwd,
    storeRoot,
    outputDirectory: routesDirectory,
    basePath: manifest.basePath,
    pageLayout,
    current,
    historical,
  })
  // The default-locale build drafts every locale first, then composes every
  // locale manifest's version shells so the merged output carries /v/,
  // /zh/v/, and /bn/v/. A locale-scoped build (`--locale zh`) composes only
  // the requested locale's history.
  const discoveredLocales = discoverLocaleManifests(io)
  const isLocaleScopedBuild = discoveredLocales.some(locale => locale.manifest.basePath === manifest.basePath)
  const extraMounts: { routesDirectory: string, basePath: string }[] = []
  if (!isLocaleScopedBuild) {
    for (const locale of discoveredLocales) {
      if (locale.manifest.basePath === manifest.basePath)
        continue
      const localeStore = resolveArtifactStore(io.cwd, locale.manifest)
      const localeCurrent = readDraftVersionArtifactManifest(localeStore, locale.manifest.artifacts!.siteId)
      if (!localeCurrent || localeCurrent.versionId !== locale.manifest.current.id) {
        throw new Error(`No built artifact draft exists for locale /${locale.slug}/ current ${locale.manifest.current.id}. Run \`sveltepress versions build --locale ${locale.slug}\` first.`)
      }
      const localeHistorical = locale.manifest.versions.map((version) => {
        const artifact = readVersionArtifactManifest(localeStore, locale.manifest.artifacts!.siteId, version.id)
        if (!artifact)
          throw new Error(`Missing published artifact manifest for /${locale.slug}/ ${version.id}.`)
        return artifact
      })
      const localeRoutesDirectory = join(io.cwd, `.sveltepress/version-shell-routes-${locale.slug}`)
      await generateVersionShellRoutes({
        siteRoot: io.cwd,
        storeRoot: localeStore,
        outputDirectory: localeRoutesDirectory,
        basePath: locale.manifest.basePath,
        pageLayout,
        current: localeCurrent,
        historical: localeHistorical,
      })
      extraMounts.push({ routesDirectory: localeRoutesDirectory, basePath: locale.manifest.basePath })
    }
  }
  await runViteBuild(io, routesDirectory, storeRoot, config.siteId, manifest.basePath, extraMounts)
  io.stdout(`Composed ${report.currentRoutes} current and ${report.historicalRoutes} historical routes from reusable page artifacts.`)
}

function discoverLocaleSlugs(siteRoot: string): string[] {
  return readdirSync(siteRoot)
    .filter(name => /^sveltepress\.versions\.[a-z0-9-]+\.json$/.test(name))
    .map(name => name.replace(/^sveltepress\.versions\./, '').replace(/\.json$/, ''))
    .sort()
}

function siblingLocaleDirs(io: IncrementalCliIO, localeDir: string): string[] {
  // Default-locale scans of src/routes must skip sibling locale trees.
  // Locale-scoped scans already root under src/routes/<locale>.
  if (localeDir)
    return []
  return discoverLocaleSlugs(io.cwd)
}

function discoverLocaleManifests(io: IncrementalCliIO): Array<{ slug: string, manifest: VersionManifest }> {
  const results: Array<{ slug: string, manifest: VersionManifest }> = []
  for (const entry of readdirSync(io.cwd, { withFileTypes: true })) {
    if (!entry.isFile() || !/^sveltepress\.versions\.[a-z0-9-]+\.json$/.test(entry.name))
      continue
    const slug = entry.name.replace(/^sveltepress\.versions\./, '').replace(/\.json$/, '')
    const localeManifest = loadVersionManifest(io.cwd, entry.name, {
      localeDir: slug,
      excludeDirs: discoverLocaleSlugs(io.cwd).filter(other => other !== slug),
    })
    if (localeManifest?.artifacts)
      results.push({ slug, manifest: localeManifest })
  }
  return results
}

export async function createIncrementalVersion(input: {
  io: IncrementalCliIO
  manifest: VersionManifest
  nextId: string
  label: string
  writeManifest: (manifest: VersionManifest) => Promise<void>
}) {
  const config = requireIncrementalConfig(input.manifest)
  const storeRoot = resolveArtifactStore(input.io.cwd, input.manifest)
  const draft = readDraftVersionArtifactManifest(storeRoot, config.siteId)
  if (!draft || draft.versionId !== input.manifest.current.id)
    throw new Error(`Current version ${input.manifest.current.id} has not been built. Run \`sveltepress versions build\` before creating a version.`)
  assertDraftMatchesSource(input.io.cwd, input.manifest, draft)
  const previous = input.manifest.versions[0]
    ? readVersionArtifactManifest(storeRoot, config.siteId, input.manifest.versions[0].id)
    : null
  if (input.manifest.versions[0] && !previous)
    throw new Error(`Missing previous artifact ${input.manifest.versions[0].id}; cannot publish ${draft.versionId}.`)
  const sidebar = input.io.resolveSidebar ? await input.io.resolveSidebar(input.io.cwd) : input.manifest.current.sidebar
  const published = await publishDraftVersionArtifactManifest({
    storeRoot,
    siteId: config.siteId,
    versionId: input.manifest.current.id,
    previous,
  })
  const frozen: DocumentationVersion = {
    ...input.manifest.current,
    status: 'stable',
    routes: Object.keys(published.pages).sort(),
    sidebar: sidebar as DocumentationVersion['sidebar'],
    sourceHash: versionSourceHash(Object.values(published.pages)),
    changes: input.manifest.current.changes,
  }
  const sourceRoot = resolveVersionSources(input.io.cwd, input.manifest)
  let wroteDelta = false
  try {
    writeVersionSourceDelta({
      siteRoot: input.io.cwd,
      sourceRoot,
      sourceRoutesDirectory: localeContext(input.io, input.manifest).sourceRoutesDirectory,
      manifest: published,
      previous,
      metadata: frozen,
    })
    wroteDelta = true
  }
  catch (error) {
    removeVersionArtifactManifest(storeRoot, config.siteId, published.versionId)
    throw error
  }
  const next: VersionManifest = {
    ...input.manifest,
    current: { id: input.nextId, label: input.label },
    versions: [frozen, ...input.manifest.versions],
  }
  try {
    await input.writeManifest(next)
  }
  catch (error) {
    if (wroteDelta)
      removeVersionSourceDelta(sourceRoot, published.versionId)
    removeVersionArtifactManifest(storeRoot, config.siteId, published.versionId)
    throw error
  }
  input.io.stdout(`Published ${frozen.id} as an immutable artifact delta and advanced current to ${input.nextId}.`)
}

export async function migrateIncrementalSite(
  io: IncrementalCliIO,
  manifest: VersionManifest,
  options: IncrementalOptions,
  writeManifest: (manifest: VersionManifest) => Promise<void>,
) {
  if (manifest.artifacts)
    throw new Error('This site already uses incremental version artifacts.')
  const siteId = options.siteId ?? basename(io.cwd).replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '')
  if (!siteId)
    throw new Error('Cannot derive a site ID; pass --site-id <id>.')
  const store = options.store ?? '.sveltepress/version-artifacts'
  const sources = 'version-deltas'
  const migratedVersions = manifest.versions.map(version => ({ ...version }))
  const migratedManifest: VersionManifest = {
    ...manifest,
    versions: migratedVersions,
    artifacts: { mode: 'incremental', siteId, store, sources },
  }
  const storeRoot = resolve(io.cwd, store)
  const sourceRoot = resolve(io.cwd, sources)
  const compile = await resolvePageCompiler(io)
  const fingerprints = resolveFingerprints(io.cwd, migratedManifest)
  let previous: VersionArtifactManifest | null = null
  for (const version of [...manifest.versions].reverse()) {
    const routesDirectory = join(io.cwd, 'src/routes', manifest.basePath.slice(1), version.id)
    if (!existsSync(routesDirectory))
      throw new Error(`Cannot migrate ${version.id}: legacy snapshot directory is missing.`)
    const pages = collectPageArtifactInputs(io.cwd, {
      basePath: '/__sveltepress_no_nested_version_base__',
      routesDir: relative(io.cwd, routesDirectory),
    })
    const compileInput = (page: PageArtifactInput) => compileArtifactPage(io.cwd, page, routesDirectory, compile)
    const result = previous
      ? await buildVersionArtifacts({
          storeRoot,
          previous,
          plan: planVersionBuild({ siteId, versionId: version.id, previous, pages, fingerprints }),
          compile: compileInput,
        })
      : await buildInitialVersionArtifacts({ storeRoot, siteId, versionId: version.id, pages, fingerprints, compile: compileInput })
    const migratedVersion = migratedVersions.find(candidate => candidate.id === version.id)!
    migratedVersion.sourceHash = versionSourceHash(Object.values(result.manifest.pages))
    writeVersionSourceDelta({
      siteRoot: io.cwd,
      sourceRoot,
      sourceRoutesDirectory: routesDirectory,
      manifest: result.manifest,
      previous,
      metadata: migratedVersion,
    })
    previous = result.manifest
  }
  const currentPages = collectPageArtifactInputs(io.cwd, { basePath: manifest.basePath })
  const currentCompile = (page: PageArtifactInput) => compileArtifactPage(io.cwd, page, join(io.cwd, 'src/routes'), compile)
  const currentResult = previous
    ? await buildVersionArtifacts({
        storeRoot,
        previous,
        plan: planVersionBuild({ siteId, versionId: manifest.current.id, previous, pages: currentPages, fingerprints }),
        compile: currentCompile,
        persist: false,
      })
    : await buildInitialVersionArtifacts({
        storeRoot,
        siteId,
        versionId: manifest.current.id,
        pages: currentPages,
        fingerprints,
        compile: currentCompile,
        persist: false,
      })
  writeDraftVersionArtifactManifest(storeRoot, currentResult.manifest)

  const legacyBase = join(io.cwd, 'src/routes', manifest.basePath.slice(1))
  const backup = join(io.cwd, '.sveltepress', `legacy-version-sources-${Date.now()}`)
  let moved = false
  try {
    if (existsSync(legacyBase)) {
      mkdirSync(dirname(backup), { recursive: true })
      renameSync(legacyBase, backup)
      moved = true
    }
    await writeManifest(migratedManifest)
    if (moved)
      rmSync(backup, { recursive: true, force: true })
  }
  catch (error) {
    if (moved && !existsSync(legacyBase) && existsSync(backup)) {
      mkdirSync(dirname(legacyBase), { recursive: true })
      renameSync(backup, legacyBase)
    }
    throw error
  }
  io.stdout(`Migrated ${manifest.versions.length} historical versions and ${currentPages.length} current pages to incremental artifacts.`)
}

export async function validateIncrementalArtifacts(io: IncrementalCliIO, manifest: VersionManifest) {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const sourceRoot = resolveVersionSources(io.cwd, manifest)
  const reconstructionRoot = join(io.cwd, '.sveltepress/version-source-validation')
  const versionIds: string[] = []
  let previousInputs: PageArtifactInput[] = []
  let previousArtifact: VersionArtifactManifest | null = null
  try {
    for (const version of [...manifest.versions].reverse()) {
      versionIds.push(version.id)
      const delta = readVersionSourceDelta(sourceRoot, version.id)
      if (delta.siteId !== config.siteId)
        throw new Error(`[sveltepress:versions] Source delta ${version.id} belongs to site ${delta.siteId}, not ${config.siteId}.`)
      if (delta.metadataHash !== versionMetadataHash(version))
        throw new Error(`[sveltepress:versions] Source delta ${version.id} frozen metadata drifted from its immutable hash.`)
      const ctx = localeContext(io, manifest)
      materializeVersionSourceDeltas({ sourceRoot, versionIds, outputDirectory: reconstructionRoot, localeDir: ctx.localeDir || undefined })
      const inputs = collectPageArtifactInputs(reconstructionRoot, { basePath: ctx.basePath, routesDir: ctx.routesDir })
      if (versionSourceHash(inputs) !== version.sourceHash)
        throw new Error(`[sveltepress:versions] Source delta ${version.id} drifted from its frozen source hash.`)
      validateSourceDeltaInventory(delta, previousInputs, inputs, ctx.localeDir || undefined)

      const artifact = readVersionArtifactManifest(storeRoot, config.siteId, version.id)
      if (artifact) {
        validateVersionArtifactManifest(artifact, previousArtifact ?? undefined)
        if (versionSourceHash(Object.values(artifact.pages)) !== version.sourceHash)
          throw new Error(`[sveltepress:versions] Artifact manifest ${version.id} drifted from its frozen source hash.`)
        for (const page of Object.values(artifact.pages))
          await validateStoredPageArtifact(storeRoot, page.artifactHash)
        previousArtifact = artifact
      }
      else {
        previousArtifact = null
      }
      previousInputs = inputs
    }
  }
  finally {
    rmSync(reconstructionRoot, { recursive: true, force: true })
  }
  const draft = readDraftVersionArtifactManifest(storeRoot, config.siteId)
  if (draft?.versionId === manifest.current.id) {
    for (const page of Object.values(draft.pages))
      await validateStoredPageArtifact(storeRoot, page.artifactHash)
  }
  io.stdout(`Incremental artifacts are valid (${manifest.versions.length} published version${manifest.versions.length === 1 ? '' : 's'}).`)
}

export function publishIncrementalStatus(io: IncrementalCliIO, manifest: VersionManifest, options: IncrementalOptions) {
  const config = requireIncrementalConfig(manifest)
  const versionId = options.positional[0]
  if (!versionId || !manifest.versions.some(version => version.id === versionId))
    throw new Error('versions publish requires an already-created historical version ID.')
  const artifact = readVersionArtifactManifest(resolveArtifactStore(io.cwd, manifest), config.siteId, versionId)
  if (!artifact)
    throw new Error(`Missing published artifact manifest for ${versionId}.`)
  io.stdout(JSON.stringify({ siteId: config.siteId, versionId, manifestHash: artifactManifestHash(artifact), pages: Object.keys(artifact.pages).length }, null, 2))
}

export function garbageCollectIncrementalArtifacts(io: IncrementalCliIO, manifest: VersionManifest, options: IncrementalOptions) {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const referenced = new Set<string>()
  const draft = readDraftVersionArtifactManifest(storeRoot, config.siteId)
  for (const page of Object.values(draft?.pages ?? {}))
    referenced.add(page.artifactHash)
  for (const version of manifest.versions) {
    const artifact = readVersionArtifactManifest(storeRoot, config.siteId, version.id)
    for (const page of Object.values(artifact?.pages ?? {}))
      referenced.add(page.artifactHash)
  }
  const blobsRoot = join(storeRoot, 'blobs')
  const stale = existsSync(blobsRoot)
    ? readdirSync(blobsRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !referenced.has(entry.name))
        .map(entry => entry.name)
        .sort()
    : []
  if (!options.dryRun) {
    for (const hash of stale)
      rmSync(join(blobsRoot, hash), { recursive: true, force: true })
  }
  io.stdout(`${options.dryRun ? 'Would remove' : 'Removed'} ${stale.length} unreferenced page artifact${stale.length === 1 ? '' : 's'}.`)
}

function requireIncrementalConfig(manifest: VersionManifest) {
  if (!manifest.artifacts || manifest.artifacts.mode !== 'incremental')
    throw new Error('This command requires artifacts.mode = "incremental". Run `sveltepress versions migrate` first.')
  return manifest.artifacts
}

function localeContext(io: IncrementalCliIO, manifest: VersionManifest): { localeDir: string, routesDir: string, basePath: string, sourceRoutesDirectory: string } {
  const segments = manifest.basePath.split('/').filter(Boolean)
  const localeDir = segments.length > 1 ? segments[0] : ''
  if (!localeDir)
    return { localeDir: '', routesDir: 'src/routes', basePath: manifest.basePath, sourceRoutesDirectory: join(io.cwd, 'src/routes') }
  return {
    localeDir,
    routesDir: `src/routes/${localeDir}`,
    basePath: `/${segments.slice(1).join('/')}`,
    sourceRoutesDirectory: join(io.cwd, 'src/routes', localeDir),
  }
}

function assertDraftMatchesSource(siteRoot: string, manifest: VersionManifest, draft: VersionArtifactManifest) {
  const segments = manifest.basePath.split('/').filter(Boolean)
  const localeDir = segments.length > 1 ? segments[0] : ''
  const ctx = {
    basePath: localeDir ? `/${segments.slice(1).join('/')}` : manifest.basePath,
    routesDir: localeDir ? `src/routes/${localeDir}` : 'src/routes',
  }
  const pages = collectPageArtifactInputs(siteRoot, {
    basePath: ctx.basePath,
    routesDir: ctx.routesDir,
    excludeDirs: localeDir ? [] : discoverLocaleSlugs(siteRoot),
  })
  const current = Object.fromEntries(pages.map(page => [page.route, page.inputHash]))
  const built = Object.fromEntries(Object.values(draft.pages).map(page => [page.route, page.inputHash]))
  if (JSON.stringify(current) !== JSON.stringify(built))
    throw new Error('Current source has changed since the artifact draft was built. Run `sveltepress versions build` again.')
  const fingerprints = resolveFingerprints(siteRoot, manifest)
  const releaseBoundary = ({ artifactSchema, pageCompiler, shell, planner }: VersionArtifactFingerprints) => ({
    artifactSchema,
    pageCompiler,
    shell,
    planner,
  })
  if (JSON.stringify(releaseBoundary(fingerprints)) !== JSON.stringify(releaseBoundary(draft.fingerprints)))
    throw new Error('The artifact compiler fingerprint has changed since the draft was built. Run `sveltepress versions build` again.')
}

function validateSourceDeltaInventory(
  delta: ReturnType<typeof readVersionSourceDelta>,
  previous: PageArtifactInput[],
  current: PageArtifactInput[],
  localeDir?: string,
) {
  const canonicalize = (file: string) => {
    if (!localeDir)
      return file
    const prefix = `src/routes/${localeDir}/`
    return file.startsWith(prefix) ? `src/routes/${file.slice(prefix.length)}` : file
  }
  const previousByRoute = new Map(previous.map(page => [page.route, page]))
  const currentRoutes = new Set(current.map(page => page.route))
  const expectedPages = current
    .filter(page => previousByRoute.get(page.route)?.inputHash !== page.inputHash)
    .map(page => ({
      route: page.route,
      files: [...new Set([...page.files, ...page.dependencies].map(canonicalize))].sort(),
    }))
    .sort((left, right) => left.route.localeCompare(right.route))
  const expectedRemoved = previous
    .map(page => page.route)
    .filter(route => !currentRoutes.has(route))
    .sort()
  if (JSON.stringify(delta.pages) !== JSON.stringify(expectedPages)
    || JSON.stringify(delta.removedRoutes) !== JSON.stringify(expectedRemoved)) {
    throw new Error(`[sveltepress:versions] Source delta ${delta.versionId} inventory drifted from its files.`)
  }
}

async function compileArtifactPage(
  siteRoot: string,
  page: PageArtifactInput,
  routesDirectory: string,
  compile: NonNullable<IncrementalCliIO['compilePage']>,
) {
  const pageFile = page.files.find(file => /\+page(?:@[\w-]+)?\.(?:md|svelte)$/.test(file))
  if (!pageFile)
    throw new Error(`Cannot locate the page source for ${page.route}.`)
  const filename = resolve(siteRoot, pageFile)
  const artifact = await compile(filename, readFileSync(filename, 'utf8'), { routesDirectory, siteRoot })
  const metadata = JSON.parse(String(artifact.files['metadata.json'] ?? '{}'))
  metadata.route = page.route
  metadata.fm ??= {}
  metadata.sourceFile = pageFile
  artifact.files['metadata.json'] = `${JSON.stringify(metadata, null, 2)}\n`
  for (const sourceFile of [...new Set([...page.files, ...page.dependencies])])
    artifact.files[`sources/${sourceFile}`] = readFileSync(resolve(siteRoot, sourceFile))
  return artifact
}

async function resolvePageCompiler(io: IncrementalCliIO): Promise<NonNullable<IncrementalCliIO['compilePage']>> {
  if (io.compilePage)
    return io.compilePage
  const config = await resolveSiteViteConfig(io.cwd)
  const api = config.plugins
    .map((plugin: any) => plugin?.api?.sveltepress)
    .find((value: any) => typeof value?.compilePageArtifact === 'function')
  if (!api)
    throw new Error('Cannot find the @sveltepress/vite page artifact compiler in this site Vite config.')
  return api.compilePageArtifact.bind(api)
}

async function ensureHistoricalArtifacts(
  io: IncrementalCliIO,
  manifest: VersionManifest,
  compile: NonNullable<IncrementalCliIO['compilePage']>,
) {
  const config = requireIncrementalConfig(manifest)
  const storeRoot = resolveArtifactStore(io.cwd, manifest)
  const chronological = [...manifest.versions].reverse()
  if (!chronological.length)
    return
  const sourceRoot = resolveVersionSources(io.cwd, manifest)
  const reconstructionRoot = join(io.cwd, '.sveltepress/version-source-reconstruction')
  const fingerprints = resolveFingerprints(io.cwd, manifest)
  let previous: VersionArtifactManifest | null = null
  let previousInputs: PageArtifactInput[] = []
  const ids: string[] = []
  try {
    for (const version of chronological) {
      ids.push(version.id)
      const ctx = localeContext(io, manifest)
      materializeVersionSourceDeltas({ sourceRoot, versionIds: ids, outputDirectory: reconstructionRoot, localeDir: ctx.localeDir || undefined })
      const routesDirectory = join(reconstructionRoot, ctx.routesDir)
      const pages = collectPageArtifactInputs(reconstructionRoot, { basePath: ctx.basePath, routesDir: ctx.routesDir })
      const delta = readVersionSourceDelta(sourceRoot, version.id)
      if (versionSourceHash(pages) !== version.sourceHash)
        throw new Error(`[sveltepress:versions] Source delta ${version.id} drifted from its frozen source hash.`)
      if (delta.metadataHash !== versionMetadataHash(version))
        throw new Error(`[sveltepress:versions] Source delta ${version.id} frozen metadata drifted from its immutable hash.`)
      validateSourceDeltaInventory(delta, previousInputs, pages, ctx.localeDir || undefined)

      const existing = readCachedArtifactManifest(storeRoot, config.siteId, version.id)
      if (existing && await cachedArtifactIsReusable(storeRoot, existing, previous, version, fingerprints)) {
        previous = existing
        previousInputs = pages
        continue
      }
      if (existing)
        removeVersionArtifactManifest(storeRoot, config.siteId, version.id)
      const compileInput = (page: PageArtifactInput) => compileArtifactPage(reconstructionRoot, page, routesDirectory, compile)
      const result = previous
        ? await buildVersionArtifacts({
            storeRoot,
            previous,
            plan: planVersionBuild({ siteId: config.siteId, versionId: version.id, previous, pages, fingerprints }),
            compile: compileInput,
          })
        : await buildInitialVersionArtifacts({
            storeRoot,
            siteId: config.siteId,
            versionId: version.id,
            pages,
            fingerprints,
            compile: compileInput,
          })
      previous = result.manifest
      previousInputs = pages
    }
  }
  finally {
    rmSync(reconstructionRoot, { recursive: true, force: true })
  }
}

function readCachedArtifactManifest(storeRoot: string, siteId: string, versionId: string): VersionArtifactManifest | null {
  try {
    return readVersionArtifactManifest(storeRoot, siteId, versionId)
  }
  catch {
    removeVersionArtifactManifest(storeRoot, siteId, versionId)
    return null
  }
}

async function cachedArtifactIsReusable(
  storeRoot: string,
  artifact: VersionArtifactManifest,
  previous: VersionArtifactManifest | null,
  version: DocumentationVersion,
  fingerprints: VersionArtifactFingerprints,
): Promise<boolean> {
  try {
    validateVersionArtifactManifest(artifact, previous ?? undefined)
    if (!previous && artifact.parent)
      return false
    if (versionSourceHash(Object.values(artifact.pages)) !== version.sourceHash)
      return false
    if (artifact.fingerprints.artifactSchema !== fingerprints.artifactSchema
      || artifact.fingerprints.pageCompiler !== fingerprints.pageCompiler) {
      return false
    }
    for (const page of Object.values(artifact.pages)) {
      try {
        await validateStoredPageArtifact(storeRoot, page.artifactHash)
      }
      catch {
        rmSync(join(storeRoot, 'blobs', page.artifactHash), { recursive: true, force: true })
        return false
      }
    }
    return true
  }
  catch {
    return false
  }
}

async function resolvePageLayout(io: IncrementalCliIO): Promise<string> {
  if (io.compilePage)
    return '@sveltepress/theme-default/PageLayout.svelte'
  const config = await resolveSiteViteConfig(io.cwd)
  const api = config.plugins.map((plugin: any) => plugin?.api?.sveltepress).find((value: any) => value?.pageLayout)
  if (!api?.pageLayout)
    throw new Error('The configured SveltePress theme does not expose a page layout for artifact composition.')
  return api.pageLayout
}

async function resolveSiteViteConfig(siteRoot: string): Promise<any> {
  const { resolveConfig } = await import('vite')
  return resolveConfig({ root: siteRoot }, 'build')
}

async function runViteBuild(
  io: IncrementalCliIO,
  routesDirectory: string,
  storeRoot: string,
  siteId: string,
  basePath: string,
  extraMounts: { routesDirectory: string, basePath: string }[] = [],
) {
  // The version base may be locale-composed (e.g. `/zh/v`): mount every
  // segment under `src/routes` so historical routes land inside the locale.
  const mounts = [{ routesDirectory, basePath }, ...extraMounts]
  const mountedHistoryRoutes: string[] = []
  for (const mount of mounts) {
    const baseSegments = mount.basePath.split('/').filter(Boolean)
    const generatedHistoryRoutes = join(mount.routesDirectory, ...baseSegments)
    const mountedHistoryRoute = join(io.cwd, 'src/routes', ...baseSegments)
    const generatedMarker = join(mountedHistoryRoute, '.sveltepress-generated-shells.json')
    if (existsSync(generatedMarker))
      rmSync(mountedHistoryRoute, { recursive: true, force: true })
    if (existsSync(mountedHistoryRoute))
      throw new Error(`[sveltepress:versions] Cannot compose incremental routes because ${mountedHistoryRoute} already exists.`)
    if (!existsSync(generatedHistoryRoutes))
      throw new Error('[sveltepress:versions] Generated historical route shells are missing.')
    renameSync(generatedHistoryRoutes, mountedHistoryRoute)
    writeFileSync(generatedMarker, `${JSON.stringify({ siteId, generated: true })}\n`, { flag: 'wx' })
    mountedHistoryRoutes.push(mountedHistoryRoute)
  }
  const previousStore = process.env.SVELTEPRESS_ARTIFACT_STORE
  const previousSiteId = process.env.SVELTEPRESS_ARTIFACT_SITE_ID
  process.env.SVELTEPRESS_ARTIFACT_STORE = storeRoot
  process.env.SVELTEPRESS_ARTIFACT_SITE_ID = siteId
  try {
    if (io.runBuild)
      return await io.runBuild({ cwd: io.cwd, routesDirectory, storeRoot, siteId })
    const { build } = await import('vite')
    await build({ root: io.cwd })
  }
  finally {
    for (const mountedHistoryRoute of mountedHistoryRoutes)
      rmSync(mountedHistoryRoute, { recursive: true, force: true })
    restoreEnvironment('SVELTEPRESS_ARTIFACT_STORE', previousStore)
    restoreEnvironment('SVELTEPRESS_ARTIFACT_SITE_ID', previousSiteId)
  }
}

function restoreEnvironment(key: string, value: string | undefined) {
  if (value === undefined)
    delete process.env[key]
  else
    process.env[key] = value
}

function resolveFingerprints(siteRoot: string, manifest: VersionManifest): VersionArtifactFingerprints {
  const compilerInputs = collectFingerprintFiles(siteRoot)
  const compilerHash = hashFiles(siteRoot, compilerInputs)
  const indexHash = createHash('sha256').update(JSON.stringify({
    basePath: manifest.basePath,
    versions: [manifest.current, ...manifest.versions].map(version => ({
      id: version.id,
      label: version.label,
      status: version.status,
      routes: version.routes,
    })),
  })).digest('hex')
  return {
    artifactSchema: PAGE_ARTIFACT_MODULE_SCHEMA,
    pageCompiler: compilerHash,
    shell: compilerHash,
    index: indexHash,
    planner: 'forward-delta-v1',
  }
}

function collectFingerprintFiles(siteRoot: string): string[] {
  const names = [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mjs',
    'svelte.config.js',
    'svelte.config.ts',
  ]
  const files = names.map(name => join(siteRoot, name)).filter(path => existsSync(path) && statSync(path).isFile())
  let directory = siteRoot
  while (true) {
    const lockfile = join(directory, 'pnpm-lock.yaml')
    if (existsSync(lockfile)) {
      files.push(lockfile)
      break
    }
    const parent = dirname(directory)
    if (parent === directory)
      break
    directory = parent
  }
  return [...new Set(files)].sort()
}

function hashFiles(root: string, files: string[]): string {
  const hash = createHash('sha256')
  for (const file of files) {
    hash.update(relative(root, file))
    hash.update('\0')
    hash.update(readFileSync(file))
    hash.update('\0')
  }
  return hash.digest('hex')
}
