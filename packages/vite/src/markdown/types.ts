import type { MdsvexOptions } from 'mdsvex'

export interface Options {
  mdsvexOptions?: MdsvexOptions
}

export type Highlighter = (code: string, lang?: string) => Promise<string>
