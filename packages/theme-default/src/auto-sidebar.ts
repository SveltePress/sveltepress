import type { LinkItem } from 'virtual:sveltepress/theme-default'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

export interface AutoSidebarOptions {
  /**
   * Enable auto-generated sidebar
   */
  enabled: boolean
  /**
   * Routes directory, default 'src/routes'
   */
  routesDir?: string
  /**
   * Root paths to generate sidebar for, e.g. ['/guide/', '/reference/']
   * If not specified, auto-detect from top-level route directories
   */
  roots?: string[]
}

interface PageMeta {
  title: string
  order: number
  sidebar: boolean
  sidebarTitle?: string
  collapsible?: boolean
}

function extractFrontmatter(filePath: string): Record<string, unknown> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!match)
      return {}

    const fm: Record<string, unknown> = {}
    for (const line of match[1].split('\n')) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1)
        continue
      const key = line.slice(0, colonIdx).trim()
      let value: unknown = line.slice(colonIdx + 1).trim()

      // Parse booleans and numbers
      if (value === 'true')
        value = true
      else if (value === 'false')
        value = false
      else if (/^-?\d+(?:\.\d+)?$/.test(value as string))
        value = Number(value)

      fm[key] = value
    }
    return fm
  }
  catch {
    return {}
  }
}

function getPageMeta(filePath: string): PageMeta {
  const fm = extractFrontmatter(filePath)
  return {
    title: (fm.sidebarTitle as string) || (fm.title as string) || '',
    order: typeof fm.order === 'number' ? fm.order : 100,
    sidebar: fm.sidebar !== false,
    sidebarTitle: fm.sidebarTitle as string | undefined,
    collapsible: fm.collapsible as boolean | undefined,
  }
}

function humanize(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function isGroupDir(name: string): boolean {
  return /^\(.*\)$/.test(name)
}

function isDynamicRoute(name: string): boolean {
  return /^\[.*\]$/.test(name)
}

function isPrivate(name: string): boolean {
  return name.startsWith('_')
}

function shouldSkipDir(name: string): boolean {
  return isDynamicRoute(name) || isPrivate(name)
}

function findPageFile(dirPath: string): string | null {
  for (const name of ['+page.md', '+page.svelte']) {
    const filePath = join(dirPath, name)
    try {
      if (statSync(filePath).isFile())
        return filePath
    }
    catch {}
  }
  return null
}

function getSubDirs(dirPath: string): string[] {
  try {
    return readdirSync(dirPath).filter((name) => {
      if (name.startsWith('+') || name.startsWith('.'))
        return false
      try {
        return statSync(join(dirPath, name)).isDirectory()
      }
      catch {
        return false
      }
    })
  }
  catch {
    return []
  }
}

/**
 * Build the URL path from a filesystem path relative to routes dir.
 * Strips parenthesized group segments like (group).
 */
function buildUrlPath(relativePath: string): string {
  const segments = relativePath.split(/[/\\]/).filter(Boolean)
  const urlSegments = segments.filter(s => !isGroupDir(s))
  return `/${urlSegments.join('/')}/`
}

/**
 * Recursively scan a directory and build sidebar items.
 * @param dirPath - absolute path to the current directory
 * @param routesDir - absolute path to the routes root
 * @param depth - current nesting depth (0 = root of a sidebar section)
 */
function scanDir(dirPath: string, routesDir: string, depth: number): LinkItem[] {
  const subDirs = getSubDirs(dirPath)
  const items: Array<LinkItem & { _order: number }> = []

  for (const name of subDirs) {
    if (shouldSkipDir(name))
      continue

    const subDirPath = join(dirPath, name)

    // Handle group directories — they are transparent in URL structure
    if (isGroupDir(name)) {
      const groupItems = scanDir(subDirPath, routesDir, depth)
      items.push(...groupItems.map(item => ({ ...item, _order: (item as LinkItem & { _order: number })._order ?? 100 })))
      continue
    }

    const pageFile = findPageFile(subDirPath)
    const childDirs = getSubDirs(subDirPath).filter(n => !shouldSkipDir(n) && !isPrivate(n))
    // Also check group dirs for children
    const hasGroupChildren = childDirs.some(n => isGroupDir(n) && getSubDirs(join(subDirPath, n)).length > 0)
    const hasRealChildren = childDirs.some(n => !isGroupDir(n))
    const hasChildren = hasRealChildren || hasGroupChildren

    if (!pageFile && !hasChildren)
      continue

    const meta = pageFile ? getPageMeta(pageFile) : { title: '', order: 100, sidebar: true, collapsible: undefined }

    if (!meta.sidebar)
      continue

    const title = meta.title || humanize(name)
    const relPath = relative(routesDir, subDirPath)
    const urlPath = buildUrlPath(relPath)

    if (hasChildren) {
      // This is a group with nested items
      const nestedItems = scanDir(subDirPath, routesDir, depth + 1)
      const item: LinkItem & { _order: number } = {
        title,
        _order: meta.order,
        items: nestedItems,
      }
      if (meta.collapsible !== undefined)
        item.collapsible = meta.collapsible

      // If this dir also has its own page, add it as first item
      if (pageFile) {
        const selfItem: LinkItem = {
          title,
          to: urlPath,
        }
        item.items = [selfItem, ...nestedItems]
      }

      items.push(item)
    }
    else {
      // Leaf page
      items.push({
        title,
        to: urlPath,
        _order: meta.order,
      })
    }
  }

  // Sort by order, then alphabetically
  items.sort((a, b) => {
    if (a._order !== b._order)
      return a._order - b._order
    return (a.title || '').localeCompare(b.title || '')
  })

  // Strip _order from output
  return items.map(({ _order, ...rest }) => rest)
}

/**
 * Detect root sidebar paths from the routes directory.
 * Returns paths like ['/guide/', '/reference/'].
 */
function detectRoots(routesDir: string): string[] {
  const dirs = getSubDirs(routesDir)
  const roots: string[] = []

  for (const name of dirs) {
    if (shouldSkipDir(name) || isPrivate(name))
      continue

    const dirPath = join(routesDir, name)

    if (isGroupDir(name)) {
      // Look inside group dirs for real route dirs
      const innerDirs = getSubDirs(dirPath)
      for (const inner of innerDirs) {
        if (!shouldSkipDir(inner) && !isPrivate(inner) && !isGroupDir(inner))
          roots.push(`/${inner}/`)
      }
      continue
    }

    // Only include dirs that have at least one page somewhere inside
    const hasPages = hasPageFiles(dirPath)
    if (hasPages)
      roots.push(`/${name}/`)
  }

  return roots
}

function hasPageFiles(dirPath: string): boolean {
  if (findPageFile(dirPath))
    return true

  for (const name of getSubDirs(dirPath)) {
    if (hasPageFiles(join(dirPath, name)))
      return true
  }
  return false
}

/**
 * Find the actual filesystem dir for a root path, handling group dirs.
 */
function findRootDir(routesDir: string, rootPath: string): string | null {
  // rootPath like '/guide/' -> segment 'guide'
  const segment = rootPath.replace(/^\/|\/$/g, '').split('/')[0]
  if (!segment)
    return null

  // Direct match
  const directPath = join(routesDir, segment)
  try {
    if (statSync(directPath).isDirectory())
      return directPath
  }
  catch {}

  // Check inside group dirs
  for (const name of getSubDirs(routesDir)) {
    if (isGroupDir(name)) {
      const groupPath = join(routesDir, name, segment)
      try {
        if (statSync(groupPath).isDirectory())
          return groupPath
      }
      catch {}
    }
  }

  return null
}

export function isAutoSidebarOptions(sidebar: unknown): sidebar is AutoSidebarOptions {
  return typeof sidebar === 'object'
    && sidebar !== null
    && 'enabled' in sidebar
    && (sidebar as AutoSidebarOptions).enabled === true
}

/**
 * Generate sidebar configuration by scanning the routes directory.
 */
export function generateSidebar(autoOptions: AutoSidebarOptions): Record<string, LinkItem[]> {
  const routesDir = resolve(autoOptions.routesDir || 'src/routes')
  const roots = autoOptions.roots || detectRoots(routesDir)
  const sidebar: Record<string, LinkItem[]> = {}

  for (const root of roots) {
    const rootDir = findRootDir(routesDir, root)
    if (!rootDir)
      continue

    const items = scanDir(rootDir, routesDir, 0)
    if (items.length > 0)
      sidebar[root] = items
  }

  return sidebar
}
