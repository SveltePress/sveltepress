import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SourceMapConsumer } from 'source-map-js'
import type { CreateTwoslashOptions, TwoslashExecuteOptions, TwoslashInstance, TwoslashNode } from 'twoslash'
import { createTwoslasher as createTwoslasherBase } from 'twoslash'
import { svelte2tsx } from 'svelte2tsx'

const dirname = fileURLToPath(new URL('.', import.meta.url))

const additionalTypes = readFileSync(resolve(dirname, 'types-template.d.ts'), 'utf-8')

export interface CreateTwoslashSvelteOptions extends CreateTwoslashOptions {
  customTypes?: string
}

export interface TwoslashSvelteExecuteOptions extends TwoslashExecuteOptions {
}

export async function createTwoslasher(createTwoslashSvelteOptions: CreateTwoslashSvelteOptions = {}): Promise<TwoslashInstance> {
  const base = await createTwoslasherBase({
    ...createTwoslashSvelteOptions,
  })
  function twoslasher(code: string, extension?: string, options: TwoslashSvelteExecuteOptions = {}) {
    if (extension !== 'svelte')
      return base(code, extension, options)
    const codeLines = code.split('\n')
    const tsxDoc = svelte2tsx(code, {
      filename: 'source.svelte',
      isTsFile: true,
    })

    const consumer = new SourceMapConsumer(tsxDoc.map as any)
    const twoslashReturn = base([tsxDoc.code, additionalTypes].join('\n'), 'tsx', {
      compilerOptions: {
        jsx: 1,
        types: ['@sveltepress/vite/types', '@sveltepress/theme-default/types'],
      },
      shouldGetHoverInfo(identifier) {
        return !['__sveltets', 'Index__', 'svelteHTML', '$$_', 'target'].some(id => identifier.startsWith(id))
      },
    })

    twoslashReturn.meta.extension = 'svelte'

    function mapNode<T extends TwoslashNode>(node: T) {
      const { line, column } = consumer.originalPositionFor({
        line: node.line + 1,
        column: node.character,
      })
      node.line = line - 1
      node.character = column

      node.start = codeLines.slice(0, line - 1).reduce((acc, l) => acc + l.length + 1, 0) + column

      return node
    }

    twoslashReturn.code = code

    twoslashReturn.hovers.forEach(mapNode)

    twoslashReturn.nodes = twoslashReturn.nodes.filter(n => n.line > -1)
    return twoslashReturn
  }

  twoslasher.getCacheMap = base.getCacheMap

  return twoslasher
}
