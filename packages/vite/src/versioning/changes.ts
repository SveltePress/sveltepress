import type {
  VersionChangePage,
  VersionChangeSection,
  VersionChangeSet,
  VersionManifest,
} from './index.js'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { parse } from 'yaml'

interface PageChangeMetadata {
  exclude: boolean
  title: string
  summary?: string
  sections: VersionChangeSection[]
}

export function computeVersionChangeSet(
  siteRoot: string,
  manifest: VersionManifest,
  versionId = manifest.current.id,
): VersionChangeSet {
  const version = versionId === manifest.current.id
    ? manifest.current
    : manifest.versions.find(candidate => candidate.id === versionId)
  if (!version)
    throw new Error(`[sveltepress:versions] Unknown version "${versionId}".`)
  if (versionId !== manifest.current.id && version.changes)
    return version.changes

  return deriveVersionChangeSet(siteRoot, manifest, versionId)
}

export function validateFrozenVersionChangeSets(siteRoot: string, manifest: VersionManifest): void {
  for (const version of manifest.versions) {
    const derived = deriveVersionChangeSet(siteRoot, manifest, version.id)
    if (version.changes && stableJson(version.changes) !== stableJson(derived)) {
      throw new Error(
        `[sveltepress:versions] Frozen changes for ${version.id} and snapshot content have drifted. Recreate or repair the snapshot metadata.`,
      )
    }
  }
  deriveVersionChangeSet(siteRoot, manifest, manifest.current.id)
}

function deriveVersionChangeSet(siteRoot: string, manifest: VersionManifest, versionId: string): VersionChangeSet {
  const version = versionId === manifest.current.id
    ? manifest.current
    : manifest.versions.find(candidate => candidate.id === versionId)
  if (!version)
    throw new Error(`[sveltepress:versions] Unknown version "${versionId}".`)

  const historicalIndex = manifest.versions.findIndex(candidate => candidate.id === versionId)
  const baseline = versionId === manifest.current.id
    ? manifest.versions[0]
    : manifest.versions[historicalIndex + 1]
  const pages = scanPages(siteRoot, manifest, versionId)
  const result: VersionChangeSet = {
    versionId,
    baselineVersionId: baseline?.id ?? null,
    newPages: [],
    updatedPages: [],
  }
  if (!baseline)
    return result

  const baselineRoutes = new Set(baseline.routes ?? [])
  for (const [route, page] of pages) {
    if (page.exclude)
      continue
    const entry: VersionChangePage = {
      route,
      title: page.title,
      ...(page.summary ? { summary: page.summary } : {}),
      sections: [],
    }
    if (!baselineRoutes.has(route)) {
      result.newPages.push(entry)
      continue
    }
    const sections = page.sections.filter(section => section.introducedIn === versionId)
    if (sections.length)
      result.updatedPages.push({ ...entry, sections })
  }
  return result
}

function stableJson(value: unknown): string {
  if (Array.isArray(value))
    return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function validateVersionChangeSet(
  value: unknown,
  context = 'version changes',
  expectedVersionId?: string,
  knownVersions?: Set<string>,
): asserts value is VersionChangeSet {
  const errors: string[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${context} must be an object.`)
  const changes = value as Record<string, unknown>
  rejectUnknown(changes, ['versionId', 'baselineVersionId', 'newPages', 'updatedPages'], context, errors)
  if (typeof changes.versionId !== 'string')
    errors.push(`${context}.versionId must be a string.`)
  else if (expectedVersionId && changes.versionId !== expectedVersionId)
    errors.push(`${context}.versionId must match "${expectedVersionId}".`)
  if (changes.baselineVersionId !== null && typeof changes.baselineVersionId !== 'string')
    errors.push(`${context}.baselineVersionId must be a string or null.`)
  else if (typeof changes.baselineVersionId === 'string' && knownVersions && !knownVersions.has(changes.baselineVersionId))
    errors.push(`${context}.baselineVersionId references unknown version "${changes.baselineVersionId}".`)
  for (const key of ['newPages', 'updatedPages'] as const) {
    if (!Array.isArray(changes[key])) {
      errors.push(`${context}.${key} must be an array.`)
      continue
    }
    changes[key].forEach((page, index) => validateChangePage(
      page,
      `${context}.${key}[${index}]`,
      errors,
      knownVersions,
      typeof changes.versionId === 'string' ? changes.versionId : undefined,
      key,
    ))
  }
  if (errors.length)
    throw new Error(errors.join('\n- '))
}

function scanPages(siteRoot: string, manifest: VersionManifest, versionId: string): Map<string, PageChangeMetadata> {
  const current = versionId === manifest.current.id
  const root = current
    ? join(siteRoot, 'src/routes')
    : join(siteRoot, 'src/routes', manifest.basePath.slice(1), versionId)
  const knownVersions = new Set([manifest.current.id, ...manifest.versions.map(version => version.id)])
  const pages = new Map<string, PageChangeMetadata>()
  if (!existsSync(root))
    return pages
  visitFiles(root, (path) => {
    if (!/\+page(?:@[\w-]+)?\.(?:md|svelte)$/.test(path))
      return
    const relativePath = relative(root, path).split(sep).join('/')
    if (current && (relativePath === manifest.basePath.slice(1) || relativePath.startsWith(`${manifest.basePath.slice(1)}/`)))
      return
    const route = toRoute(relativePath)
    const source = readFileSync(path, 'utf8')
    pages.set(route, parsePageChangeMetadata(source, path, route, knownVersions))
  })
  return pages
}

function parsePageChangeMetadata(source: string, path: string, route: string, knownVersions: Set<string>): PageChangeMetadata {
  const errors: string[] = []
  const frontmatter = parseFrontmatter(source, path)
  const rawConfig = frontmatter.versionChanges
  let exclude = false
  let summary = typeof frontmatter.description === 'string' ? frontmatter.description : undefined
  if (rawConfig !== undefined) {
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
      errors.push('versionChanges must be an object.')
    }
    else {
      const config = rawConfig as Record<string, unknown>
      rejectUnknown(config, ['exclude', 'summary'], 'versionChanges', errors)
      if (config.exclude !== undefined && typeof config.exclude !== 'boolean')
        errors.push('versionChanges.exclude must be a boolean.')
      if (config.summary !== undefined && typeof config.summary !== 'string')
        errors.push('versionChanges.summary must be a string.')
      exclude = config.exclude === true
      if (typeof config.summary === 'string')
        summary = config.summary
    }
  }

  const sections: VersionChangeSection[] = []
  const ids = new Set<string>()
  const lines = source.split(/\r?\n/)
  const parsedLines = new Set<number>()
  const directives = path.endsWith('.md') ? findSinceDirectives(source) : []
  for (const directive of directives) {
    const line = directive.position?.start.line
    const endLine = directive.position?.end.line
    if (line)
      parsedLines.add(line)
    const header = line ? lines[line - 1] ?? '' : ''
    const attributeSource = header.match(/\{(.*)\}\s*$/)?.[1] ?? ''
    const { attributes, errors: attributeErrors } = parseAttributes(attributeSource)
    errors.push(...attributeErrors.map(error => `since marker ${error}`))
    rejectUnknown(attributes, ['version', 'id', 'summary'], 'since marker', errors)
    if (!endLine || !/^:{3,}$/.test(lines[endLine - 1]?.trim() ?? ''))
      errors.push('since marker must be closed with a standalone ::: line.')
    const label = directive.children?.[0]
    const title = label?.data?.directiveLabel ? collectText(label).trim() : ''
    const version = attributes.version
    const id = attributes.id
    if (!title)
      errors.push('since marker requires a title label.')
    if (!version)
      errors.push('since marker requires a version.')
    else if (!knownVersions.has(version))
      errors.push(`since marker references unknown version "${version}".`)
    if (!id)
      errors.push('since marker requires an id.')
    else if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(id))
      errors.push(`since marker id "${id}" is invalid.`)
    else if (ids.has(id))
      errors.push(`since marker id "${id}" is duplicate.`)
    else
      ids.add(id)
    if (title && version && id && knownVersions.has(version)) {
      sections.push({
        id,
        title,
        ...(attributes.summary ? { summary: attributes.summary } : {}),
        introducedIn: version,
      })
    }
  }
  if (path.endsWith('.md')) {
    stripMarkdownCode(source).split('\n').forEach((line, index) => {
      if (/^ {0,3}:{3,}since\b/.test(line) && !parsedLines.has(index + 1))
        errors.push(`since marker on line ${index + 1} has invalid Markdown directive syntax.`)
    })
  }
  if (errors.length)
    throw new Error(`[sveltepress:versions] Invalid version changes in ${path}:\n- ${errors.join('\n- ')}`)
  return {
    exclude,
    title: typeof frontmatter.title === 'string' ? frontmatter.title : route,
    ...(summary ? { summary } : {}),
    sections,
  }
}

function stripMarkdownCode(source: string): string {
  let fence: { marker: string, length: number } | null = null
  return source.split(/\r?\n/).map((line) => {
    const candidate = line.match(/^ {0,3}([`~])/)?.[1]
    if (candidate) {
      const trimmed = line.trimStart()
      let length = 0
      while (trimmed[length] === candidate)
        length += 1
      if (fence && candidate === fence.marker && length >= fence.length && !trimmed.slice(length).trim()) {
        fence = null
        return ''
      }
      if (!fence && length >= 3) {
        fence = { marker: candidate, length }
        return ''
      }
    }
    return fence ? '' : stripInlineCode(line)
  }).join('\n')
}

function stripInlineCode(line: string): string {
  let result = ''
  let offset = 0
  while (offset < line.length) {
    if (line[offset] !== '`') {
      result += line[offset]
      offset += 1
      continue
    }
    let length = 1
    while (line[offset + length] === '`')
      length += 1
    const marker = '`'.repeat(length)
    const end = line.indexOf(marker, offset + length)
    if (end === -1) {
      result += marker
      offset += length
    }
    else {
      offset = end + length
    }
  }
  return result
}

function parseFrontmatter(source: string, path: string): Record<string, unknown> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match)
    return {}
  try {
    const value = parse(match[1])
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  }
  catch (error) {
    throw new Error(`[sveltepress:versions] Cannot parse frontmatter in ${path}: ${(error as Error).message}`)
  }
}

function parseAttributes(source: string): { attributes: Record<string, string>, errors: string[] } {
  const attributes: Record<string, string> = {}
  const errors: string[] = []
  let offset = 0
  while (offset < source.length) {
    while (/\s/.test(source[offset] ?? ''))
      offset += 1
    if (offset >= source.length)
      break
    const keyMatch = source.slice(offset).match(/^([\w-]+)/)
    if (!keyMatch) {
      errors.push(`has invalid attribute syntax near "${source.slice(offset)}".`)
      break
    }
    const key = keyMatch[1]
    offset += key.length
    if (source[offset] !== '=') {
      errors.push(`has invalid attribute syntax near "${source.slice(offset - key.length)}".`)
      break
    }
    offset += 1
    const quote = source[offset]
    let value = ''
    if (quote === '"' || quote === '\'') {
      const end = source.indexOf(quote, offset + 1)
      if (end === -1) {
        errors.push(`has an unterminated value for "${key}".`)
        break
      }
      value = source.slice(offset + 1, end)
      offset = end + 1
    }
    else {
      const valueMatch = source.slice(offset).match(/^(\S+)/)
      if (!valueMatch) {
        errors.push(`requires a value for "${key}".`)
        break
      }
      value = valueMatch[1]
      offset += value.length
    }
    if (Object.hasOwn(attributes, key))
      errors.push(`has duplicate attribute "${key}".`)
    attributes[key] = value
  }
  return { attributes, errors }
}

interface DirectiveNode {
  type?: string
  name?: string
  value?: string
  data?: { directiveLabel?: boolean }
  children?: DirectiveNode[]
  position?: { start: { line: number }, end: { line: number } }
}

function findSinceDirectives(source: string): DirectiveNode[] {
  const tree = unified().use(remarkParse).use(remarkDirective as any).parse(source) as DirectiveNode
  const directives: DirectiveNode[] = []
  walkTree(tree, (node) => {
    if (node.type === 'containerDirective' && node.name === 'since')
      directives.push(node)
  })
  return directives
}

function walkTree(node: DirectiveNode, callback: (node: DirectiveNode) => void) {
  callback(node)
  node.children?.forEach(child => walkTree(child, callback))
}

function collectText(node: DirectiveNode): string {
  return node.value ?? node.children?.map(collectText).join('') ?? ''
}

function validateChangePage(
  value: unknown,
  context: string,
  errors: string[],
  knownVersions?: Set<string>,
  expectedVersionId?: string,
  group?: 'newPages' | 'updatedPages',
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${context} must be an object.`)
    return
  }
  const page = value as Record<string, unknown>
  rejectUnknown(page, ['route', 'title', 'summary', 'sections'], context, errors)
  if (typeof page.route !== 'string' || !page.route.startsWith('/'))
    errors.push(`${context}.route must be an absolute route.`)
  if (typeof page.title !== 'string' || !page.title)
    errors.push(`${context}.title must be a non-empty string.`)
  if (page.summary !== undefined && typeof page.summary !== 'string')
    errors.push(`${context}.summary must be a string.`)
  if (!Array.isArray(page.sections)) {
    errors.push(`${context}.sections must be an array.`)
    return
  }
  if (group === 'newPages' && page.sections.length)
    errors.push(`${context}.sections must be empty for a new page.`)
  if (group === 'updatedPages' && !page.sections.length)
    errors.push(`${context}.sections must contain at least one updated section.`)
  const ids = new Set<string>()
  page.sections.forEach((section, index) => {
    const sectionContext = `${context}.sections[${index}]`
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      errors.push(`${sectionContext} must be an object.`)
      return
    }
    const item = section as Record<string, unknown>
    rejectUnknown(item, ['id', 'title', 'summary', 'introducedIn'], sectionContext, errors)
    for (const key of ['id', 'title', 'introducedIn'] as const) {
      if (typeof item[key] !== 'string' || !item[key])
        errors.push(`${sectionContext}.${key} must be a non-empty string.`)
    }
    if (typeof item.id === 'string' && ids.has(item.id))
      errors.push(`${sectionContext}.id "${item.id}" is duplicate.`)
    else if (typeof item.id === 'string')
      ids.add(item.id)
    if (typeof item.introducedIn === 'string' && knownVersions && !knownVersions.has(item.introducedIn))
      errors.push(`${sectionContext}.introducedIn references unknown version "${item.introducedIn}".`)
    else if (typeof item.introducedIn === 'string' && expectedVersionId && item.introducedIn !== expectedVersionId)
      errors.push(`${sectionContext}.introducedIn must match "${expectedVersionId}".`)
    if (item.summary !== undefined && typeof item.summary !== 'string')
      errors.push(`${sectionContext}.summary must be a string.`)
  })
}

function rejectUnknown(value: Record<string, unknown>, allowed: string[], context: string, errors: string[]) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      errors.push(`${context} has unknown field "${key}".`)
  }
}

function visitFiles(directory: string, callback: (path: string) => void) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory())
      visitFiles(path, callback)
    else if (entry.isFile())
      callback(path)
  }
}

function toRoute(relativePath: string): string {
  const normalized = relativePath.split(sep).join('/').replace(/(?:^|\/)\+page(?:@[\w-]+)?\.(?:md|svelte)$/, '')
  const segments = normalized.split('/').filter(segment => segment && !/^\(.*\)$/.test(segment))
  return segments.length ? `/${segments.join('/')}/` : '/'
}
