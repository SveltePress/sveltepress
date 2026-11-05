import type { LiveCodeBlock } from './remark-live-code.js'
import type { BlogPost } from './types.js'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import { readingTime } from './reading-time.js'
import { rehypeBasePath } from './rehype-base-path.js'
import { rehypeFigure } from './rehype-figure.js'
import { rehypeHeadingIds } from './rehype-heading-ids.js'
import { remarkCodeBlocks } from './remark-code-blocks.js'
import { remarkCodeTabs } from './remark-code-tabs.js'
import { remarkDemos } from './remark-demos.js'
import { remarkDisplayMath } from './remark-display-math.js'
import { remarkLiveCode } from './remark-live-code.js'
import { remarkPullQuote } from './remark-pull-quote.js'

function createProcessor(base: string, liveCodeLabel: string | undefined, demoNames: string[]) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkMath)
    .use(remarkDisplayMath)
    .use(remarkPullQuote)
    .use(remarkDemos, { names: demoNames })
    .use(remarkLiveCode, { sourceLabel: liveCodeLabel })
    .use(remarkCodeTabs)
    .use(remarkCodeBlocks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFigure)
    .use(rehypeHeadingIds)
    .use(rehypeKatex, { strict: false })
    .use(rehypeBasePath, { base })
    .use(rehypeStringify, { allowDangerousHtml: true })
}

const processors = new Map<string, ReturnType<typeof createProcessor>>()

function processorFor(base: string, liveCodeLabel: string | undefined, demoNames: string[]) {
  const key = `${base}\0${liveCodeLabel ?? ''}\0${demoNames.join('\n')}`
  let processor = processors.get(key)
  if (!processor) {
    processor = createProcessor(base, liveCodeLabel, demoNames)
    processors.set(key, processor)
  }
  return processor
}

/** Split raw markdown into frontmatter YAML block and body text. */
function splitFrontmatter(raw: string): { yaml: string, body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match)
    return { yaml: '', body: raw }
  return { yaml: match[1], body: match[2] }
}

/**
 * Replace each rendered KaTeX formula with its TeX source: the rendered
 * markup holds the formula twice (MathML and HTML), and its text is
 * unreadable once the tags are stripped.
 */
function katexToTex(html: string): string {
  const open = '<span class="katex">'
  let out = ''
  let from = 0
  for (let start = html.indexOf(open); start !== -1; start = html.indexOf(open, from)) {
    let depth = 0
    let end = -1
    const tag = /<span\b|<\/span>/g
    tag.lastIndex = start
    for (let m = tag.exec(html); m; m = tag.exec(html)) {
      depth += m[0] === '</span>' ? -1 : 1
      if (depth === 0) {
        end = m.index + m[0].length
        break
      }
    }
    if (end === -1)
      break
    const formula = html.slice(start, end)
    const tex = formula.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/)?.[1] ?? ''
    out += `${html.slice(from, start)} ${tex} `
    from = end
  }
  return out + html.slice(from)
}

/**
 * Plain text for excerpt generation: drop code blocks, scripts and styles
 * (an excerpt of escaped source reads as `&#x3C;canvas …`), strip the
 * remaining tags and decode the entities the HTML serializer wrote.
 */
function stripHtml(html: string): string {
  return katexToTex(html)
    .replace(/<(pre|script|style|details|button)\b[\s\S]*?<\/\1>/g, ' ')
    // the code block's language / title labels
    .replace(/<div class="svp-code-block--(?:lang|title)">[^<]*<\/div>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&(lt|gt|quot|amp);/g, (_, name: string) => ({ lt: '<', gt: '>', quot: '"', amp: '&' })[name] ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ParsedPost extends BlogPost {
  draft: boolean
  /** Sources of the post's ```svelte live blocks; written to disk, never shipped in the post JSON. */
  liveCode: LiveCodeBlock[]
}

export interface ParsePostOptions {
  /** SvelteKit's `paths.base`, so site-absolute URLs in the body resolve. */
  base?: string
  /** Label of the show/hide source toggle under a live code demo. */
  liveCodeLabel?: string
  /** The project's demo components; `<Name />` tags for these get mounted. */
  demoNames?: string[]
}

export async function parsePost(
  slug: string,
  raw: string,
  options: ParsePostOptions = {},
): Promise<ParsedPost> {
  const { yaml, body } = splitFrontmatter(raw)
  const fm = yaml ? (parseYaml(yaml) as Record<string, unknown>) : {}

  const file = await processorFor(options.base ?? '', options.liveCodeLabel, options.demoNames ?? []).process(body)
  const contentHtml = String(file)
  const liveCode = (file.data.liveCode as LiveCodeBlock[] | undefined) ?? []

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
    liveCode,
  }
}
