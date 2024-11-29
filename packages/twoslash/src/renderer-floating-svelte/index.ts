import type { Element, ElementContent, Text } from 'hast'
import type { ShikiTransformerContextCommon } from 'shiki'
import { rendererRich, type RendererRichOptions, type TwoslashRenderer } from '@shikijs/twoslash'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { defaultHandlers, toHast } from 'mdast-util-to-hast'

interface RendererFloatingSvelteOptions extends RendererRichOptions {}

function rendererFloatingSvelte(options: RendererFloatingSvelteOptions = {}): TwoslashRenderer {
  const rich = rendererRich({
    ...options,
    renderMarkdown,
    renderMarkdownInline,
    hast: {
      hoverToken: {
        tagName: 'Floating',
      },
      hoverCompose: compose,
      queryToken: {
        tagName: 'Floating',
        properties: {
          alwaysShow: '{true}',
        },
      },
      queryCompose: compose,
      completionCompose({ popup, cursor }) {
        return [
          <Element>{
            type: 'element',
            tagName: 'Floating',
            properties: {
              alwaysShow: '{true}',
            },
            children: [
              cursor,
              {
                type: 'comment',
                value: 'svp-floating-snippet-start',
                data: {
                  svpFloatingSnippet: true,
                },
              },
              popup,
              {
                type: 'comment',
                value: 'svp-floating-snippet-end',
                data: {
                  svpFloatingSnippet: true,
                },
              },
            ],
          },
        ]
      },
    },
  })
  return rich
}

function compose(parts: { token: Element | Text, popup: Element }): ElementContent[] {
  return [
    {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [parts.token as any],
    },
    {
      type: 'comment',
      value: 'svp-floating-snippet-start',
      data: {
        svpFloatingSnippet: true,
      },
    },
    parts.popup,
    {
      type: 'comment',
      value: 'svp-floating-snippet-end',
      data: {
        svpFloatingSnippet: true,
      },
    },
  ]
}

function renderMarkdown(this: ShikiTransformerContextCommon, md: string): ElementContent[] {
  const mdast = fromMarkdown(
    md.replace(/\{@link ([^}]*)\}/g, '$1').replace(/```ts(.*)```/gs, (_match, p1) => {
      return `\`\`\`js${p1}\`\`\``
    }),
    { mdastExtensions: [gfmFromMarkdown()] },
  )
  return (toHast(
    mdast,
    {
      handlers: {
        code: (state, node) => {
          const lang = node.lang
          if (lang) {
            const options = {
              ...this.options,
              lang,
              transformers: [],
            }
            const res = this.codeToHast(
              node.value,
              options,
            ).children[0]
            return res as Element
          }
          return defaultHandlers.code(state, node)
        },
      },
    },
  ) as Element).children
}

function renderMarkdownInline(this: ShikiTransformerContextCommon, md: string, context?: string): ElementContent[] {
  if (context === 'tag:param')
    md = md.replace(/^([\w$-]+)/, '`$1` ')

  const children = renderMarkdown.call(this, md)
  if (children.length === 1 && children[0].type === 'element' && children[0].tagName === 'p')
    return children[0].children
  return children
}

export default rendererFloatingSvelte
