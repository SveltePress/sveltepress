import type { Highlighter } from '../types.js'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import emoji from 'remark-emoji'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { type Plugin, unified } from 'unified'
import { visit } from 'unist-util-visit'
import { parse } from 'yaml'
import disableLeafTextDirective from './disable-leaft-text-directive.js'
import reserveSvelteCommands from './reserve-svelte-commands.js'

interface CompileOptions {
  mdContent: string
  highlighter?: Highlighter
  remarkPlugins?: Array<Plugin<any[], any> | [Plugin<any[], any>, any]>
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
  let processorAfterRemarkParse = applyRemarkPluginsBeforeRehype(remarkPlugins)
  const highlightAsyncTasks: (PromiseSettledResult<any>[])[] = []

  if (highlighter) {
    processorAfterRemarkParse = processorAfterRemarkParse.use(
      () => {
        return async (tree: any) => {
          const asyncTasks: any[] = []
          visit(tree, (node, idx, parent) => {
            if (node.type === 'code') {
              const asyncTask = async () => {
                if (idx) {
                  const highlightedCode = await highlighter?.(node.value, node.lang, node.meta)
                  parent.children[idx] = {
                    type: 'html',
                    value: highlightedCode,
                  }
                }
              }
              asyncTasks.push(asyncTask())
            }
          })
          highlightAsyncTasks.push(await Promise.allSettled(asyncTasks))
        }
      },
    )
  }

  await Promise.allSettled(highlightAsyncTasks)

  let processorAfterRehype = processorAfterRemarkParse
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel,
      handlers: {
        inlineCode(state, node) {
          return {
            type: 'element',
            tagName: 'code',
            properties: {},
            children: [
              {
                type: 'text',
                value: `{\`${node.value}\`}`,
              },
            ],
          }
        },
      },
    })

  rehypePlugins?.forEach((plugin) => {
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

export function applyRemarkPluginsBeforeRehype(remarkPlugins?: Array<Plugin<any[], any> | [Plugin<any[], any>, any]>) {
  let processorAfterRemarkParse = unified()
    .use(remarkParse as any)

  remarkPlugins?.forEach((plugin) => {
    if (Array.isArray(plugin)) {
      const [p, options] = plugin
      processorAfterRemarkParse = processorAfterRemarkParse.use(p, options) as any
    }
    else {
      processorAfterRemarkParse = processorAfterRemarkParse.use(plugin) as any
    }
  })

  processorAfterRemarkParse
    .use(emoji)
    .use(remarkDirective as any)
    .use(disableLeafTextDirective)
    .use(reserveSvelteCommands)
    .use(remarkFrontmatter as any)
    .use(remarkExtractFrontmatter, { yaml: parse })
    .use(remarkGfm as any)

  return processorAfterRemarkParse
}
