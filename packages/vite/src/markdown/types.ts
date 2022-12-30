import type { MdsvexOptions } from 'mdsvex'
import type { Plugin } from 'unified'

export type RemarkLiveCode = Plugin<[], any>
export interface Options {
  mdsvexOptions?: MdsvexOptions
}

export type Highlighter = (code: string, lang?: string) => Promise<string>
