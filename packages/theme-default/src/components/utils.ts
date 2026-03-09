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
  // Normalize both by removing trailing slashes for comparison
  const normalizedLink = link?.replace(/\/$/, '') || ''
  const normalizedRouteId = routeId?.replace(/\/$/, '') || ''
  return normalizedLink === normalizedRouteId || link?.startsWith(`${normalizedRouteId}/`)
}
