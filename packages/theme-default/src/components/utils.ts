import { base } from '$app/paths'

export function getPathFromBase(path: string) {
  if (path === '/')
    return base || '/'
  if (!base || !path.startsWith('/') || (path === base || path.startsWith(`${base}/`)))
    return path
  return `${base}${path}`
}

export function parseImageSrc(src: string) {
  if (src.startsWith('//'))
    return src
  return getPathFromBase(src)
}

export function isLinkActive(link: string, routeId: string) {
  return link === routeId || link.startsWith(`${routeId}/`)
}
