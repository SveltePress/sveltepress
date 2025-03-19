import { base } from '$app/paths'

function getPathFromBase(path: string) {
  if (path === '/')
    return base || '/'
  if (!base || !path.startsWith('/') || (path === base || path.startsWith(`${base}/`)))
    return path
  return `${base}${path}`
}

function parseImageSrc(src: string) {
  if (src.startsWith('//'))
    return src
  return getPathFromBase(src)
}

export { getPathFromBase, parseImageSrc }
