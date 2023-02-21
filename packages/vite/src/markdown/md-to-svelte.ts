import { type Plugin, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { VFile } from 'vfile'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import remarkStringify from 'remark-stringify'
import { parse } from 'yaml'
import remarkFrontmatter from 'remark-frontmatter'
import type { Highlighter } from '../types'
import parseFrontmatter from './parse-frontmatter'

interface CompileOptions {
  mdContent: string
  highlighter?: Highlighter
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
}

export default async ({ mdContent, remarkPlugins, rehypePlugins }: CompileOptions) => {
  let processorBeforeRehype = unified().use(remarkParse)

  remarkPlugins?.forEach(plugin => {
    processorBeforeRehype = processorBeforeRehype.use(plugin) as any
  })

  processorBeforeRehype = processorBeforeRehype.use(remarkRehype)

  rehypePlugins?.forEach(plugin => {
    processorBeforeRehype = processorBeforeRehype.use(plugin) as any
  })

  processorBeforeRehype = processorBeforeRehype
    .use(remarkStringify)
    .use(remarkFrontmatter)
    .use(remarkExtractFrontmatter, { yaml: parse })
    .use(parseFrontmatter)

  const file = await processorBeforeRehype
    .use(rehypeStringify)
    .process(new VFile(mdContent))

  const code = String(file)

  const data = file.data

  return { code, data }
}
