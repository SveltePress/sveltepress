import { base } from '$app/paths'

function getPathFromBase(path: string) {
  if (path === '/')
    return ''
  if (!base)
    return path
  return `${base}${path}`
}

function parseImageSrc(src: string) {
  if (src.startsWith('data:'))
    return src
  if (src.startsWith('http://') || src.startsWith('https://'))
    return src
  return getPathFromBase(src)
}

export { getPathFromBase, parseImageSrc }
