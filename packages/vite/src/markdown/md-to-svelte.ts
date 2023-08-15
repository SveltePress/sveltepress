import { type Plugin, unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import { parse } from 'yaml'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import remarkGfm from 'remark-gfm'
import emoji from 'remark-emoji'
import type { Highlighter } from '../types'
import reserveSvelteCommands from './reserve-svelte-commands'
import disableLeafTextDirective from './disable-leaft-text-directive'

interface CompileOptions {
  mdContent: string
  highlighter?: Highlighter
  remarkPlugins?: Array<Plugin | [Plugin, any]>
  rehypePlugins?: Plugin[]
  filename: string
  footnoteLabel?: string
}

export default async function ({
  mdContent,
  remarkPlugins,
  rehypePlugins,
  highlighter,
  filename,
  footnoteLabel,
}: CompileOptions): Promise< {
  data: Record<string, any>
  code: string
}> {
  let processorBeforeRehype = unified()
    .use(remarkParse as any)
    .use(emoji)
    .use(remarkDirective as any)
    .use(disableLeafTextDirective)
    .use(reserveSvelteCommands)
    .use(remarkFrontmatter as any)
    .use(remarkExtractFrontmatter, { yaml: parse })
    .use(remarkGfm as any)

  remarkPlugins?.forEach(plugin => {
    if (Array.isArray(plugin)) {
      const [p, options] = plugin
      processorBeforeRehype = processorBeforeRehype.use(p, options) as any
    } else {
      processorBeforeRehype = processorBeforeRehype.use(plugin) as any
    }
  })

  if (highlighter) {
    processorBeforeRehype = processorBeforeRehype.use(
      () => {
        return async (tree: any) => {
          const codeNodes: any[] = []
          visit(tree, (node, idx, parent) => {
            if (node.type === 'code') {
              codeNodes.push({
                node,
                idx,
                parent,
              })
            }
          })
          await Promise.all(codeNodes.map(async ({ node, idx, parent }) => {
            const highlightedCode = await highlighter?.(node.value, node.lang, node.meta)
            parent.children.splice(idx, 1, {
              type: 'html',
              value: highlightedCode,
            })
          }))
        }
      }) }

  let processorAfterRehype = processorBeforeRehype = processorBeforeRehype
    .use(remarkRehype as any, {
      allowDangerousHtml: true,
      footnoteLabel,
    })

  rehypePlugins?.forEach(plugin => {
    processorAfterRehype = processorAfterRehype.use(plugin) as any
  })

  const vFile = await processorAfterRehype
    .use(rehypeStringify as any, {
      allowDangerousHtml: true,
      allowDangerousCharacters: true,
    })
    .process({
      value: mdContent,
      path: filename,
    })

  const code = String(vFile)

  const data = vFile?.data || {}

  return {
    code,
    data,
  }
}
