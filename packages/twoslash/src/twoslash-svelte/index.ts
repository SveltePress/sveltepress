import type { CreateTwoslashOptions, TwoslashExecuteOptions, TwoslashInstance } from 'twoslash'
import { createTwoslasher as createTwoslasherBase } from 'twoslash'

export interface CreateTwoslashSvelteOptions extends CreateTwoslashOptions {

}

export interface TwoslashSvelteExecuteOptions extends TwoslashExecuteOptions {
}

export function createTwoslasher(options: CreateTwoslashSvelteOptions = {}): TwoslashInstance {
  const base = createTwoslasherBase(options)

  function twoslasher(code: string, extension?: string, options: TwoslashSvelteExecuteOptions = {}) {
    if (extension !== 'svelte')
      return base(code, extension, options)
    return base(code, extension, {
      ...options,
      compilerOptions: {
        ...options?.compilerOptions,
        plugins: [{
          name: 'typescript-svelte-plugin',
        }],
      },
    })
  }

  twoslasher.getCacheMap = base.getCacheMap
  return twoslasher
}
