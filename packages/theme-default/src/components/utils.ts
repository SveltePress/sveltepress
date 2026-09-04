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

export function withSwitchSuffix(
  href: string,
  hash: string,
  fallback: boolean,
  fallbackParam: string,
) {
  const hashIndex = href.indexOf('#')
  const pathAndQuery = hashIndex === -1 ? href : href.slice(0, hashIndex)
  const hrefHash = hashIndex === -1 ? '' : href.slice(hashIndex)
  const nextHash = hrefHash || hash || ''
  if (!fallback)
    return `${pathAndQuery}${nextHash}`
  const sep = pathAndQuery.includes('?') ? '&' : '?'
  return `${pathAndQuery}${sep}${fallbackParam}=1${nextHash}`
}

export function inViewHeadingHash() {
  if (typeof document === 'undefined')
    return ''
  const active = document.querySelector('.toc a.item.active')
  const href = active?.getAttribute('href')
  return href?.startsWith('#') ? href : ''
}

export function isLinkActive(link: string, routeId: string) {
  // Normalize both by removing trailing slashes for comparison
  const normalizedLink = link?.replace(/\/$/, '') || ''
  const normalizedRouteId = routeId?.replace(/\/$/, '') || ''
  return normalizedLink === normalizedRouteId || link?.startsWith(`${normalizedRouteId}/`)
}
