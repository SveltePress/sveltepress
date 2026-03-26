import type { Plugin } from 'vite'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'

const VIRTUAL_MODULE_ID = 'virtual:sveltepress/search-index'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

export interface SearchDocument {
  content: string
  headings: string[]
  href: string
  id: string
  title: string
}

function stripMarkdown(content: string): string {
  return content
    // Remove frontmatter
    .replace(/^---[\s\S]*?---/m, '')
    // Remove svelte script/style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove admonitions markers
    .replace(/:::\w+\s*\n?/g, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Collapse whitespace
    .replace(/\n{2,}/g, '\n')
    .trim()
}

function extractTitle(content: string): string {
  // Try frontmatter title first
  const fmMatch = content.match(/^---[\s\S]*?title:\s*['"]?(.+?)['"]?\s*$/m)
  if (fmMatch)
    return fmMatch[1]

  // Try first h1
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match)
    return h1Match[1]

  return ''
}

function extractHeadings(content: string): string[] {
  const headings: string[] = []
  const regex = /^#{2,3}\s+(.+)$/gm
  let match = regex.exec(content)
  while (match) {
    headings.push(match[1])
    match = regex.exec(content)
  }
  return headings
}

function scanPages(routesDir: string): SearchDocument[] {
  const documents: SearchDocument[] = []

  function walk(dir: string) {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    }
    catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      let stat
      try {
        stat = statSync(fullPath)
      }
      catch {
        continue
      }

      if (stat.isDirectory()) {
        walk(fullPath)
      }
      else if (entry === '+page.md') {
        const raw = readFileSync(fullPath, 'utf-8')
        const title = extractTitle(raw)
        if (!title)
          continue

        const rel = relative(routesDir, dir)
        const href = `/${rel.replace(/\\/g, '/')}/`

        documents.push({
          content: stripMarkdown(raw),
          headings: extractHeadings(raw),
          href,
          id: href,
          title,
        })
      }
    }
  }

  walk(routesDir)
  return documents
}

export function searchIndexPlugin(enabled = true): Plugin {
  const routesDir = resolve(process.cwd(), 'src/routes')

  return {
    name: 'sveltepress-search-index',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID)
        return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID)
        return

      if (!enabled) {
        return `export const searchDocuments = []`
      }

      const documents = scanPages(routesDir)
      return `export const searchDocuments = ${JSON.stringify(documents)}`
    },

    handleHotUpdate({ file, server }) {
      if (file.endsWith('+page.md')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
    },
  }
}
