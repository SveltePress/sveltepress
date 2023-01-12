import { compile } from 'mdsvex'
import type { MdsvexOptions } from 'mdsvex'
import type { Highlighter } from '../types.js'

export default async ({ mdContent, filename, mdsvexOptions }: {
  mdContent: string
  filename: string
  highlighter?: Highlighter
  mdsvexOptions?: MdsvexOptions
}) => {
  const transformedSvelteCode = await compile(mdContent, {
    extensions: ['.md'],
    filename,
    ...mdsvexOptions,
  }) || { code: '', data: {} }

  return transformedSvelteCode
}
