import type { BlogPost } from './types.js'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import { readingTime } from './reading-time.js'
import { remarkCodeBlocks } from './remark-code-blocks.js'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCodeBlocks)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

/** Split raw markdown into frontmatter YAML block and body text. */
function splitFrontmatter(raw: string): { yaml: string, body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match)
    return { yaml: '', body: raw }
  return { yaml: match[1], body: match[2] }
}

/** Strip HTML tags to get plain text for excerpt generation. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export interface ParsedPost extends BlogPost {
  draft: boolean
}

export async function parsePost(slug: string, raw: string): Promise<ParsedPost> {
  const { yaml, body } = splitFrontmatter(raw)
  const fm = yaml ? (parseYaml(yaml) as Record<string, unknown>) : {}

  const contentHtml = String(await processor.process(body))

  const plainBody = stripHtml(contentHtml)
  const excerpt = typeof fm.excerpt === 'string'
    ? fm.excerpt
    : plainBody.slice(0, 120).trimEnd()

  return {
    slug,
    title: String(fm.title ?? ''),
    date: fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : String(fm.date ?? ''),
    cover: typeof fm.cover === 'string' ? fm.cover : undefined,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    category: typeof fm.category === 'string' ? fm.category : undefined,
    excerpt,
    author: typeof fm.author === 'string' ? fm.author : undefined,
    readingTime: readingTime(body),
    contentHtml,
    draft: fm.draft === true,
  }
}
