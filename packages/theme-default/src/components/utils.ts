import { base } from '$app/paths'

function getPathFromBase(path: string) {
  if (path === '/')
    return ''
  if (!base)
    return path
  return `${base}${path}`
}

export { getPathFromBase }
