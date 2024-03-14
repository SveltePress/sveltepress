import { svelte2tsx } from 'svelte2tsx'
import type { CreateTwoslashOptions, TwoslashExecuteOptions, TwoslashInstance } from 'twoslash'
import { createTwoslasher as createTwoslasherBase } from 'twoslash'
import type { RawSourceMap } from 'source-map-js'
import { SourceMapConsumer } from 'source-map-js'
import additionalTypes from './additional-types.js'

export interface CreateTwoslashSvelteOptions extends CreateTwoslashOptions {

}

export interface TwoslashSvelteExecuteOptions extends TwoslashExecuteOptions {
}

export async function createTwoslasher(createTwoslashSvelteOptions: CreateTwoslashSvelteOptions = {}): Promise<TwoslashInstance> {
  const base = await createTwoslasherBase(createTwoslashSvelteOptions)
  function twoslasher(code: string, extension?: string, options: TwoslashSvelteExecuteOptions = {}) {
    if (extension !== 'svelte')
      return base(code, extension, options)

    const { code: tsxCode, map } = svelte2tsx(code, {
      filename: 'index.svelte',
    })

    const sourceMapConsumer = new SourceMapConsumer(map as unknown as RawSourceMap)

    const twoslashReturn = base(`${tsxCode}${additionalTypes}`, 'tsx', {
      compilerOptions: {
        plugins: [{
          name: 'typescript-svelte-plugin',
        }],
      },
      shouldGetHoverInfo(identifier) {
        if (identifier.startsWith('__sveltets_') || ['svelteHTML', 'createElement', 'render'].includes(identifier))
          return false

        return true
      },
    })

    twoslashReturn.meta.extension = 'svelte'

    return {
      ...twoslashReturn,
      code,
      nodes: twoslashReturn.nodes.map(n => {
        const { line, column } = sourceMapConsumer.originalPositionFor({
          line: n.line,
          column: n.character,
        })
        return {
          ...n,
          line: line || n.line,
          character: column || n.character,
        }
      }),
      hovers: twoslashReturn.hovers.map(h => {
        const { line, column } = sourceMapConsumer.originalPositionFor({
          line: h.line,
          column: h.character,
        })
        return {
          ...h,
          line: line || h.line,
          character: column || h.character,
        }
      }),
    }
  }

  twoslasher.getCacheMap = base.getCacheMap

  return twoslasher
}
