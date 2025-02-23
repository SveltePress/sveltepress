import { base } from '$app/paths'

function getPathFromBase(path: string) {
  if (path === '/')
    return ''
  if (!base)
    return path
  return `${base}${path}`
}

function parseImageSrc(src: string) {
  if (src.startsWith('/')) {
    if (src.startsWith('//'))
      return src
    if (src.startsWith(base)) {
      return src
    }
    return getPathFromBase(src)
  }
  return src
}

export { getPathFromBase, parseImageSrc }
