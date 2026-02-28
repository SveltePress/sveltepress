import type { LlmsConfig, PageInfo } from './types.js'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import yaml from 'yaml'

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>, body: string } {
  content = content.replace(/\r\n/g, '\n')
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content }
  }
  const end = content.indexOf('\n---', 3)
  if (end === -1) {
    return { frontmatter: {}, body: content }
  }
  const yamlStr = content.slice(4, end)
  const body = content.slice(end + 4).trimStart()
  let frontmatter: Record<string, unknown> = {}
  try {
    const parsed = yaml.parse(yamlStr)
    if (parsed && typeof parsed === 'object')
      frontmatter = parsed as Record<string, unknown>
  }
  catch {
    // fallback: ignore parse errors
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
  const parts = dir.split(/[/\\]/).filter(p => !/^\(.*\)$/.test(p))
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

export function generateLlmsTxt(config: LlmsConfig, siteConfig: { title?: string, description?: string }) {
  const cwd = process.cwd()
  const routesDir = resolve(cwd, config.routesDir ?? 'src/routes')
  const staticDir = resolve(cwd, 'static')

  const files = collectPages(routesDir)
  const baseUrl = config.baseUrl?.replace(/\/$/, '') ?? ''
  const title = config.title ?? siteConfig.title ?? 'Untitled'
  const description = config.description ?? siteConfig.description ?? ''

  const pages: PageInfo[] = []
  for (const filePath of files) {
    let raw: string
    try {
      raw = readFileSync(filePath, 'utf-8')
    }
    catch (err) {
      console.warn(`[sveltepress] Failed to read ${filePath}:`, err)
      continue
    }
    const { frontmatter, body } = parseFrontmatter(raw)
    const routePath = deriveRoutePath(filePath, routesDir)
    if (config.filter && !config.filter(filePath, frontmatter))
      continue
    pages.push({
      title: (frontmatter.title as string) || routePath,
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

  let isFirstSection = true
  for (const [sec, secPages] of sections) {
    if (!isFirstSection)
      fullLines.push('---')
    if (sec) {
      fullLines.push(`## ${sec}`)
      fullLines.push('')
    }
    let isFirstPageInSection = true
    for (const page of secPages) {
      const url = `${baseUrl}${page.routePath}`
      if (!isFirstPageInSection)
        fullLines.push('---')
      fullLines.push(`# [${page.title}](${url})`)
      fullLines.push('')
      if (page.content.trim()) {
        fullLines.push(page.content.trim())
        fullLines.push('')
      }
      isFirstPageInSection = false
    }
    isFirstSection = false
  }

  writeFileSync(join(staticDir, 'llms-full.txt'), fullLines.join('\n'), 'utf-8')
}
