import type { DocumentationVersion, VersionManifest } from '@sveltepress/vite/versioning'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { resolveSveltepressThemeSnapshot } from '@sveltepress/vite'
import { loadVersionManifest, validateVersionId, validateVersionManifest } from '@sveltepress/vite/versioning'

export interface CliIO {
  cwd: string
  stdout: (value: string) => void
  stderr: (value: string) => void
  resolveSidebar?: (cwd: string) => Promise<unknown>
  /** Optional embedding hook; primarily useful for testing transactional failures. */
  writeManifest?: (path: string, manifest: VersionManifest) => void | Promise<void>
}

const DEFAULT_IO: CliIO = {
  cwd: process.cwd(),
  stdout: value => process.stdout.write(`${value}\n`),
  stderr: value => process.stderr.write(`${value}\n`),
}

export async function runCli(args: string[], io: CliIO = DEFAULT_IO): Promise<number> {
  try {
    if (args[0] !== 'versions')
      throw new Error('Usage: sveltepress versions <init|create|list|validate>')
    const command = args[1]
    const options = parseArgs(args.slice(2))
    if (command === 'init')
      initializeVersions(io, options)
    else if (command === 'create')
      await createVersion(io, options)
    else if (command === 'list')
      listVersions(io)
    else if (command === 'validate')
      validateSite(io)
    else
      throw new Error('Usage: sveltepress versions <init|create|list|validate>')
    return 0
  }
  catch (error) {
    io.stderr((error as Error).message)
    return 1
  }
}

interface ParsedArgs {
  positional: string[]
  current?: string
  label?: string
  basePath?: string
  allowDirty: boolean
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = { positional: [], allowDirty: false }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--allow-dirty') {
      parsed.allowDirty = true
      continue
    }
    const key = arg === '--current' ? 'current' : arg === '--label' ? 'label' : arg === '--base-path' ? 'basePath' : null
    if (key) {
      const value = args[index + 1]
      if (!value || value.startsWith('--'))
        throw new Error(`${arg} requires a value.`)
      parsed[key] = value
      index += 1
      continue
    }
    if (arg.startsWith('--'))
      throw new Error(`Unknown option: ${arg}`)
    parsed.positional.push(arg)
  }
  return parsed
}

function initializeVersions(io: CliIO, options: ParsedArgs) {
  const manifestPath = join(io.cwd, 'sveltepress.versions.json')
  if (existsSync(manifestPath))
    throw new Error('sveltepress.versions.json already exists.')
  const currentId = options.current
  if (!currentId || !validateVersionId(currentId))
    throw new Error('--current must be a safe lowercase version ID.')
  const basePath = options.basePath ?? '/v'
  if (!/^\/[a-z0-9-]+$/.test(basePath))
    throw new Error('--base-path must be one lowercase absolute route segment such as "/v".')
  assertVersionBaseAvailable(join(io.cwd, 'src/routes'), basePath.slice(1))

  const manifest: VersionManifest = {
    $schema: './node_modules/@sveltepress/cli/schema/versions.schema.json',
    basePath,
    current: { id: currentId, label: options.label ?? currentId },
    versions: [],
    content: { include: ['**'], exclude: [], shared: [] },
  }
  validateVersionManifest(manifest)
  writeJsonAtomic(manifestPath, manifest)
  io.stdout(`Initialized document versions with current ${currentId}.`)
}

function assertVersionBaseAvailable(routesRoot: string, baseSegment: string) {
  const physicalBase = join(routesRoot, baseSegment)
  if (existsSync(physicalBase))
    throw new Error(`Version base route already exists: ${physicalBase}`)

  const visit = (directory: string, routeSegments: string[]) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink())
        continue
      if (entry.isDirectory()) {
        const nextSegments = /^\(.+\)$/.test(entry.name)
          ? routeSegments
          : [...routeSegments, entry.name]
        visit(join(directory, entry.name), nextSegments)
        continue
      }
      if (!entry.isFile() || !/^\+(?:page|layout|server)(?:\.|@)/.test(entry.name))
        continue
      const firstSegment = routeSegments[0]
      if (firstSegment === baseSegment || /^\[.+\]$/.test(firstSegment ?? '')) {
        throw new Error(
          `Version base route /${baseSegment} conflicts with SvelteKit route ${relative(routesRoot, join(directory, entry.name)).split(sep).join('/')}.`,
        )
      }
    }
  }
  visit(routesRoot, [])
}

async function createVersion(io: CliIO, options: ParsedArgs) {
  const nextId = options.positional[0]
  if (!nextId || !validateVersionId(nextId))
    throw new Error('versions create requires a safe lowercase new current version ID.')
  const manifest = requireManifest(io.cwd)
  if ([manifest.current.id, ...manifest.versions.map(version => version.id)].includes(nextId))
    throw new Error(`Version ${nextId} already exists.`)
  if (!options.allowDirty)
    assertCleanGit(io.cwd)

  const routesRoot = join(io.cwd, 'src/routes')
  const baseSegment = manifest.basePath.slice(1)
  const baseRoot = join(routesRoot, baseSegment)
  const target = join(baseRoot, manifest.current.id)
  if (existsSync(target))
    throw new Error(`Version snapshot already exists: ${target}`)

  const snapshotFiles = collectSnapshotFiles(routesRoot, baseSegment, manifest.content)
  const dependencyReport = analyzeDependencies(io.cwd, routesRoot, snapshotFiles, manifest.content.shared)
  if (dependencyReport.unsafe.length) {
    throw new Error(
      `Snapshot has dependencies outside the frozen content boundary:\n- ${dependencyReport.unsafe.join('\n- ')}\nDeclare intentional live dependencies in content.shared.`,
    )
  }
  const sidebar = io.resolveSidebar
    ? await io.resolveSidebar(io.cwd)
    : (await resolveSveltepressThemeSnapshot(io.cwd)).sidebar

  const baseRootExisted = existsSync(baseRoot)
  mkdirSync(baseRoot, { recursive: true })
  const staging = join(baseRoot, `.sveltepress-${manifest.current.id}-${randomUUID()}`)
  const manifestPath = join(io.cwd, 'sveltepress.versions.json')
  let snapshotCommitted = false
  try {
    mkdirSync(staging)
    copySnapshotFiles(routesRoot, staging, snapshotFiles)
    writeJsonAtomic(join(staging, '.sveltepress-version.json'), {
      id: manifest.current.id,
      routes: manifest.current.routes ?? [],
      sidebar,
      sharedDependencies: dependencyReport.shared,
    })
    renameSync(staging, target)
    snapshotCommitted = true

    const previous: DocumentationVersion = {
      ...manifest.current,
      status: 'stable',
      routes: manifest.current.routes ?? [],
    }
    const nextManifest: VersionManifest = {
      ...manifest,
      current: { id: nextId, label: options.label ?? nextId },
      versions: [previous, ...manifest.versions],
    }
    validateVersionManifest(nextManifest)
    if (io.writeManifest)
      await io.writeManifest(manifestPath, nextManifest)
    else
      writeJsonAtomic(manifestPath, nextManifest)
  }
  catch (error) {
    rmSync(staging, { recursive: true, force: true })
    if (snapshotCommitted)
      rmSync(target, { recursive: true, force: true })
    if (!baseRootExisted && existsSync(baseRoot) && readdirSync(baseRoot).length === 0)
      rmSync(baseRoot, { recursive: true })
    throw error
  }
  io.stdout(`Created ${manifest.current.id} snapshot and advanced current to ${nextId}.`)
}

function listVersions(io: CliIO) {
  const manifest = requireManifest(io.cwd)
  io.stdout(`current\t${manifest.current.id}\t${manifest.current.label}`)
  for (const version of manifest.versions)
    io.stdout(`${version.status ?? 'stable'}\t${version.id}\t${version.label}`)
}

function validateSite(io: CliIO) {
  const manifest = requireManifest(io.cwd)
  const routesRoot = join(io.cwd, 'src/routes')
  const baseRoot = join(io.cwd, 'src/routes', manifest.basePath.slice(1))
  const reports = [analyzeDependencies(
    io.cwd,
    routesRoot,
    collectSnapshotFiles(routesRoot, manifest.basePath.slice(1), manifest.content),
    manifest.content.shared,
  )]
  for (const version of manifest.versions) {
    const target = join(baseRoot, version.id)
    if (!existsSync(target))
      throw new Error(`Missing snapshot directory for ${version.id}: ${target}`)
    reports.push(analyzeDependencies(io.cwd, target, collectDependencyFiles(target), manifest.content.shared))
  }
  if (existsSync(baseRoot)) {
    const known = new Set(manifest.versions.map(version => version.id))
    const entries = readdirSync(baseRoot, { withFileTypes: true })
    const orphans = entries
      .filter(entry => !entry.name.startsWith('.') && (!entry.isDirectory() || !known.has(entry.name)))
      .map(entry => entry.name)
    if (orphans.length)
      throw new Error(`Orphan or conflicting entries in the version route: ${orphans.join(', ')}`)
  }
  const unsafe = [...new Set(reports.flatMap(report => report.unsafe))].sort()
  if (unsafe.length)
    throw new Error(`Version content has dependencies outside the frozen boundary:\n- ${unsafe.join('\n- ')}`)
  const shared = [...new Set([
    ...reports.flatMap(report => report.shared),
    ...manifest.versions.flatMap(version => version.sharedDependencies ?? []),
  ])].sort()
  if (shared.length)
    io.stdout(`Shared live dependencies:\n${shared.map(value => `- ${value}`).join('\n')}`)
  io.stdout(`Version manifest is valid (${manifest.versions.length} historical version${manifest.versions.length === 1 ? '' : 's'}).`)
}

function collectDependencyFiles(root: string): string[] {
  const files: string[] = []
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`Version content cannot contain symbolic links: ${relative(root, path)}`)
      if (entry.isDirectory())
        visit(path)
      else if (entry.isFile())
        files.push(path)
    }
  }
  visit(root)
  return files.sort()
}

function requireManifest(siteRoot: string): VersionManifest {
  const manifest = loadVersionManifest(siteRoot)
  if (!manifest)
    throw new Error('No sveltepress.versions.json found. Run `sveltepress versions init --current <id>` first.')
  return manifest
}

function assertCleanGit(cwd: string) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd, stdio: 'ignore' })
  }
  catch {
    return
  }
  const status = execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' }).trim()
  if (status)
    throw new Error(`Git worktree is dirty. Commit changes or rerun with --allow-dirty.\n${status}`)
}

function collectSnapshotFiles(routesRoot: string, baseSegment: string, content: VersionManifest['content']): string[] {
  if (!existsSync(routesRoot))
    throw new Error(`Routes directory does not exist: ${routesRoot}`)
  const files: string[] = []
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const source = join(directory, entry.name)
      const routeRelative = relative(routesRoot, source).split(sep).join('/')
      if (routeRelative === baseSegment || routeRelative.startsWith(`${baseSegment}/`))
        continue
      if (entry.isSymbolicLink())
        throw new Error(`Snapshot content cannot contain symbolic links: ${routeRelative}`)
      if (entry.isDirectory()) {
        visit(source)
        continue
      }
      if (!entry.isFile())
        continue
      if (!routeRelative.includes('/') && !/^\+page(?:\.|@)/.test(entry.name))
        continue
      if (matchesAny(routeRelative, content.include) && !matchesAny(routeRelative, content.exclude))
        files.push(source)
    }
  }
  visit(routesRoot)
  return files.sort()
}

function copySnapshotFiles(routesRoot: string, staging: string, files: string[]) {
  for (const source of files) {
    const destination = join(staging, relative(routesRoot, source))
    mkdirSync(dirname(destination), { recursive: true })
    cpSync(source, destination, { errorOnExist: true })
  }
}

function analyzeDependencies(siteRoot: string, routesRoot: string, files: string[], sharedRules: string[]) {
  const unsafe = new Set<string>()
  const shared = new Set<string>()
  const selected = new Set(files.map(file => resolve(file)))
  const report = (dependency: string) => {
    const normalized = dependency.split(sep).join('/')
    if (matchesAny(normalized, sharedRules))
      shared.add(normalized)
    else
      unsafe.add(normalized)
  }
  const isSelected = (target: string) => {
    const absolute = resolve(target)
    return [...selected].some(file => file === absolute || file.startsWith(`${absolute}.`) || file.startsWith(`${absolute}${sep}`))
  }

  for (const file of files) {
    if (!/\.(?:md|svelte|[cm]?[jt]s|css|scss|sass|less|styl)$/.test(file))
      continue
    const source = readFileSync(file, 'utf8')
    const dependencySource = file.endsWith('.md')
      ? [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n')
      : source
    const markdownSource = file.endsWith('.md')
      ? stripMarkdownExamples(source)
      : source
    for (const match of dependencySource.matchAll(/(?:from\s+|import\s*\(\s*|import\s+|require\s*\(\s*)['"]([^'"]+)['"]/g)) {
      const specifier = match[1]
      if (specifier.startsWith('$lib/')) {
        report(specifier)
      }
      else if (specifier.startsWith('.')) {
        const target = resolve(dirname(file), specifier)
        if (!isSelected(target))
          report(relative(siteRoot, target))
      }
    }
    for (const match of markdownSource.matchAll(/(?:\bsrc\s*=\s*|\bposter\s*=\s*)['"]([^'"]+)['"]|url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
      const specifier = match[1] ?? match[2]
      if (specifier.startsWith('/')) {
        report(`static/${specifier.replace(/^\//, '')}`)
      }
      else if (specifier.startsWith('.')) {
        const target = resolve(dirname(file), specifier)
        if (!isSelected(target))
          report(relative(siteRoot, target))
      }
    }
    for (const match of markdownSource.matchAll(/@code\(([^,\s)]+)/g)) {
      const specifier = match[1]
      const target = specifier.startsWith('.') ? resolve(dirname(file), specifier) : resolve(siteRoot, `.${specifier}`)
      if (!isSelected(target))
        report(relative(siteRoot, target))
    }
    for (const match of markdownSource.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const destination = match[1].trim().split(/\s+/, 1)[0]
      if (destination.startsWith('/'))
        report(`static/${destination.replace(/^\//, '')}`)
    }
  }
  return { unsafe: [...unsafe].sort(), shared: [...shared].sort() }
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

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some(pattern => globToRegExp(pattern).test(value))
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function writeJsonAtomic(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = join(dirname(path), `.${basename(path)}.${randomUUID()}.tmp`)
  try {
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
    renameSync(temporary, path)
  }
  finally {
    if (existsSync(temporary))
      rmSync(temporary)
  }
}
