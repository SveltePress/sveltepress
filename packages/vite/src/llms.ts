import type { LlmsConfig, PageInfo } from './types.js'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import process from 'node:process'

function parseFrontmatter(content: string): { frontmatter: Record<string, any>, body: string } {
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content }
  }
  const end = content.indexOf('\n---', 3)
  if (end === -1) {
    return { frontmatter: {}, body: content }
  }
  const yamlStr = content.slice(4, end)
  const body = content.slice(end + 4).trimStart()
  const frontmatter: Record<string, any> = {}
  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1)
      continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (key)
      frontmatter[key] = val.replace(/^['"]|['"]$/g, '')
  }
  return { frontmatter, body }
}

function deriveRoutePath(filePath: string, routesDir: string): string {
  const rel = relative(routesDir, filePath)
  // Remove +page.md filename
  const dir = rel.replace(/[/\\]\+page\.md$/, '').replace(/^\+page\.md$/, '')
  if (!dir)
    return '/'
  // Split and filter out route groups like (group)
  const parts = dir.split(sep).filter(p => !/^\(.*\)$/.test(p))
  return `/${parts.join('/')}`
}

function collectPages(dir: string): string[] {
  const results: string[] = []
  if (!existsSync(dir))
    return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...collectPages(full))
    }
    else if (entry === '+page.md') {
      results.push(full)
    }
  }
  return results
}

function sectionOf(routePath: string): string {
  if (routePath === '/')
    return ''
  const parts = routePath.split('/').filter(Boolean)
  return parts[0] || ''
}

export async function generateLlmsTxt(config: LlmsConfig, siteConfig: { title?: string, description?: string }) {
  const cwd = process.cwd()
  const routesDir = resolve(cwd, 'src/routes')
  const staticDir = resolve(cwd, 'static')

  const files = collectPages(routesDir)
  const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? ''
  const title = config.title ?? siteConfig.title ?? 'Untitled'
  const description = config.description ?? siteConfig.description ?? ''

  const pages: PageInfo[] = []
  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(raw)
    const routePath = deriveRoutePath(filePath, routesDir)
    if (config.filter && !config.filter(filePath, frontmatter))
      continue
    pages.push({
      title: frontmatter.title || routePath,
      routePath,
      content: body,
      frontmatter,
    })
  }

  if (config.sort) {
    pages.sort(config.sort)
  }
  else {
    pages.sort((a, b) => a.routePath.localeCompare(b.routePath))
  }

  // Group by first-level section
  const sections = new Map<string, PageInfo[]>()
  for (const page of pages) {
    const sec = sectionOf(page.routePath)
    if (!sections.has(sec))
      sections.set(sec, [])
    sections.get(sec)!.push(page)
  }

  // Build llms.txt (index only)
  const llmsLines: string[] = [`# ${title}`]
  if (description)
    llmsLines.push(`\n> ${description}`)
  llmsLines.push('')

  for (const [sec, secPages] of sections) {
    if (sec)
      llmsLines.push(`## ${sec}`)
    for (const page of secPages) {
      const url = `${baseUrl}${page.routePath}`
      llmsLines.push(`- [${page.title}](${url})`)
    }
    llmsLines.push('')
  }

  if (!existsSync(staticDir))
    mkdirSync(staticDir, { recursive: true })

  writeFileSync(join(staticDir, 'llms.txt'), llmsLines.join('\n'), 'utf-8')

  // Build llms-full.txt (with content)
  const fullLines: string[] = [`# ${title}`]
  if (description)
    fullLines.push(`\n> ${description}`)
  fullLines.push('')

  let isFirstPage = true
  for (const [sec, secPages] of sections) {
    if (sec) {
      fullLines.push(`## ${sec}`)
      fullLines.push('')
    }
    for (const page of secPages) {
      const url = `${baseUrl}${page.routePath}`
      if (!isFirstPage)
        fullLines.push('---\n')
      fullLines.push(`# [${page.title}](${url})`)
      fullLines.push('')
      if (page.content.trim()) {
        fullLines.push(page.content.trim())
        fullLines.push('')
      }
      isFirstPage = false
    }
  }

  writeFileSync(join(staticDir, 'llms-full.txt'), fullLines.join('\n'), 'utf-8')
}
