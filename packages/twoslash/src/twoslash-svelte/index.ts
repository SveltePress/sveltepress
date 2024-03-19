import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CreateTwoslashOptions, TwoslashExecuteOptions, TwoslashInstance, TwoslashNode } from 'twoslash'
import { createTwoslasher as createTwoslasherBase } from 'twoslash'
import { DocumentSnapshot } from 'svelte-language-server/dist/src/plugins/typescript/DocumentSnapshot.js'
import { Document } from 'svelte-language-server/dist/src/lib/documents/index.js'
import { parse } from 'svelte/compiler'

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
    const svelteDoc = new Document('index.svelte', code)

    const tsxDoc = DocumentSnapshot.fromDocument(svelteDoc, {
      parse,
      version: '4',
      transformOnTemplateError: false,
      typingsNamespace: '',
    })

    const twoslashReturn = base([tsxDoc.getFullText(), additionalTypes].join('\n'), 'tsx', {
      compilerOptions: {
        jsx: 1,
        types: ['@sveltepress/vite/types', '@sveltepress/theme-default/types'],
      },
      shouldGetHoverInfo(identifier) {
        return !['__sveltets', 'Index__', 'svelteHTML', 'render', '$$_', 'target', 'props'].some(id => identifier.startsWith(id))
      },
    })

    twoslashReturn.meta.extension = 'svelte'

    function mapNode<T extends TwoslashNode>(node: T) {
      const { line, character } = tsxDoc.getOriginalPosition(node)
      node.line = line
      node.character = character
      node.start = svelteDoc.offsetAt(node)
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
