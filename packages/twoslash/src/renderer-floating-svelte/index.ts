import { type RendererRichOptions, type TwoslashRenderer, rendererRich } from '@shikijs/twoslash'
import type { Element, ElementContent, Text } from 'hast'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { defaultHandlers, toHast } from 'mdast-util-to-hast'
import type { ShikiTransformerContextCommon } from 'shiki'

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
                type: 'element',
                tagName: 'svelte:fragment',
                properties: {
                  slot: 'floating-content',
                },
                children: [popup],
              },
            ],
          },
        ]
      },
    },
  })
  return rich
}

function compose(parts: { token: Element | Text; popup: Element }): ElementContent[] {
  return [
    {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [parts.token as any],
    },
    {
      type: 'element',
      tagName: 'svelte:fragment',
      properties: {
        slot: 'floating-content',
      },
      children: [parts.popup],
    },
  ]
}

function renderMarkdown(this: ShikiTransformerContextCommon, md: string): ElementContent[] {
  const mdast = fromMarkdown(
    md.replace(/{@link ([^}]*)}/g, '$1'), // replace jsdoc links
    { mdastExtensions: [gfmFromMarkdown()] },
  )

  return (toHast(
    mdast,
    {
      handlers: {
        code: (state, node) => {
          const lang = node.lang || ''
          if (lang) {
            return this.codeToHast(
              node.value,
              {
                ...this.options,
                transformers: [],
                lang,
              },
            ).children[0] as Element
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
