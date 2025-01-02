import type { CreateTwoslashOptions, TwoslashExecuteOptions, TwoslashInstance, TwoslashNode } from 'twoslash'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SourceMapConsumer } from 'source-map-js'
import { svelte2tsx } from 'svelte2tsx'
import { createTwoslasher as createTwoslasherBase } from 'twoslash'

const dirname = fileURLToPath(new URL('.', import.meta.url))

const additionalTypes = readFileSync(resolve(dirname, 'types-template.d.ts'), 'utf-8')

export interface CreateTwoslashSvelteOptions extends CreateTwoslashOptions {
  customTypes?: string
}

export interface TwoslashSvelteExecuteOptions extends TwoslashExecuteOptions {
}

export async function createTwoslasher(createTwoslashSvelteOptions: CreateTwoslashSvelteOptions = {}): Promise<TwoslashInstance> {
  const base = createTwoslasherBase({
    ...createTwoslashSvelteOptions,
  })
  function twoslasher(code: string, extension?: string, options: TwoslashSvelteExecuteOptions = {}) {
    const baseConfig = {
      compilerOptions: {
        jsx: 1,
        types: ['@sveltepress/vite/types', '@sveltepress/theme-default/types', '@sveltepress/theme-default/components', '@sveltejs/kit'],
        moduleResolution: 99,
        module: 199,
      },
    }
    if (extension !== 'svelte') {
      return base(code, extension, {
        ...baseConfig,
        ...options,
      })
    }
    const codeLines = code.split('\n')
    const tsxDoc = svelte2tsx(code, {
      filename: 'source.svelte',
    })

    const consumer = new SourceMapConsumer(tsxDoc.map as any)
    const twoslashReturn = base([tsxDoc.code.replace(/\$\$_\$\$;/g, ''), additionalTypes].join('\n'), 'tsx', {
      ...baseConfig,
      shouldGetHoverInfo(identifier) {
        return !['svelteHTML', 'render', 'createElement', '__svelte', '$$', 'Component'].some(id => identifier.startsWith(id))
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
