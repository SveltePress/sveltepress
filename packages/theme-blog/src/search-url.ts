export function withBase(url: string, base: string): string {
  const normalizedBase = base.replace(/\/$/, '')

  if (!normalizedBase)
    return url
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url))
    return url
  if (/^[a-z][a-z\d+.-]*:/i.test(url))
    return url
  if (url.startsWith('#'))
    return url
  if (url === normalizedBase || url.startsWith(`${normalizedBase}/`))
    return url
  if (url.startsWith('/'))
    return `${normalizedBase}${url}`

  return `${normalizedBase}/${url.replace(/^\.\//, '')}`
}
