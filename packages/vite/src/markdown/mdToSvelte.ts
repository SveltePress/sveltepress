import { compile } from 'mdsvex'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import admonitions from 'remark-admonitions'
import liveCode from '@svelte-press/remark-live-code'
import type { MdsvexOptions } from 'mdsvex'
import highlighter from './highlighter.js'

export default async ({ mdContent, filename, mdsvexOptions }: {
  mdContent: string
  filename: string
  mdsvexOptions?: MdsvexOptions
}) => {
  const transformedSvelteCode = await compile(mdContent, {
    extensions: ['.md'],
    filename,
    ...mdsvexOptions,
    highlight: {
      highlighter,
    },
    remarkPlugins: [liveCode, admonitions],
  })

  return transformedSvelteCode
}
