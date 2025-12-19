import type { Plugin } from 'unified'
import type { AcceptableRemarkPlugin, Highlighter } from '../types.js'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import emoji from 'remark-emoji'
import remarkExtractFrontmatter from 'remark-extract-frontmatter'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { parse } from 'yaml'
import disableLeafTextDirective from './disable-leaft-text-directive.js'
import markdownImagesPlugin from './parse-image.js'
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
}: CompileOptions): Promise<{
  data: Record<string, any>
  code: string
}> {
  const processorAfterRemarkParse = applyRemarkPluginsBeforeRehype(remarkPlugins)

  if (highlighter) {
    const highlighterPlugin: Plugin<any[], any> = () => {
      return async (tree: any) => {
        const highlightAsyncTasks: Array<() => Promise<any>> = []
        visit(tree, (node, idx, parent) => {
          if (node.type === 'code') {
            highlightAsyncTasks.push(async () => {
              const highlightedCode = await highlighter?.(node.value, node.lang, node.meta)
              const newNode = {
                type: 'html',
                value: highlightedCode || `<pre><code class="language-${node.lang}">${node.value}</code></pre>`,
              }
              parent.children.splice(idx, 1, newNode)
            })
          }
        })
        await Promise.all(highlightAsyncTasks.map(task => task()))
      }
    }
    processorAfterRemarkParse.use(highlighterPlugin)
  }

  let processorAfterRehype = processorAfterRemarkParse
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel,
      handlers: {
        inlineCode(state, node) {
          // Escape backticks and backslashes in the code content
          const escapedValue = node.value.replace(/\\/g, '\\\\').replace(/`/g, '\\`')
          return {
            type: 'raw',
            value: `<code>{\`${escapedValue}\`}</code>`,
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

  let code = String(vFile)

  const data = vFile?.data ?? {}
  const images = (data as any).images ?? []

  // Add braces around import names for Svelte template variables
  images.forEach(({ importName }: any) => {
    code = code.replace(importName, `{${importName}}`)
  })

  return {
    code,
    data,
  }
}

export function applyRemarkPluginsBeforeRehype(remarkPlugins?: AcceptableRemarkPlugin) {
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
    .use(markdownImagesPlugin as any)
    .use(remarkFrontmatter as any)
    .use(remarkExtractFrontmatter as any, { yaml: parse })
    .use(remarkGfm as any)

  return processorAfterRemarkParse
}
