import { type RendererRichOptions, type TwoslashRenderer, rendererRich } from '@shikijs/twoslash'
import type { Element, ElementContent, Text } from 'hast'

interface RendererFloatingSvelteOptions extends RendererRichOptions {}

function rendererFloatingSvelte(options: RendererFloatingSvelteOptions = {}): TwoslashRenderer {
  const rich = rendererRich({
    ...options,
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

export { rendererFloatingSvelte }
