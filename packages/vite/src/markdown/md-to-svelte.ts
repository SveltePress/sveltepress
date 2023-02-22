import { type Plugin, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { VFile } from 'vfile'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import { parse } from 'yaml'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import type { Highlighter } from '../types'

interface CompileOptions {
  mdContent: string
  highlighter?: Highlighter
  remarkPlugins?: Array<Plugin | [Plugin, any]>
  rehypePlugins?: Plugin[]
}

export default async ({ mdContent, remarkPlugins, rehypePlugins }: CompileOptions) => {
  let processorBeforeRehype = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkFrontmatter)
    .use(remarkExtractFrontmatter, { yaml: parse }) as any

  remarkPlugins?.forEach(plugin => {
    if (Array.isArray(plugin)) {
      const [p, options] = plugin
      processorBeforeRehype = processorBeforeRehype.use(p, options) as any
    } else {
      processorBeforeRehype = processorBeforeRehype.use(plugin) as any
    }
  })

  let processorAfterRehype = processorBeforeRehype = processorBeforeRehype.use(remarkRehype, {
    allowDangerousHtml: true,
  })

  rehypePlugins?.forEach(plugin => {
    processorAfterRehype = processorAfterRehype.use(plugin) as any
  })

  const vFile = await processorAfterRehype
    .use(rehypeStringify, {
      allowDangerousHtml: true,
      allowDangerousCharacters: true,
    })
    .process(new VFile(mdContent))

  const code = String(vFile)

  const data = vFile?.data || {}

  return {
    code,
    data,
  }
}
