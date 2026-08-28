export function getChangesetFilename(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}-update-deps.md`
}

export function isHistoricalVersionRoute(relativePath, basePath, versionIds) {
  const baseSegment = basePath.replace(/^\//, '').replace(/\/$/, '')
  return versionIds.some(versionId => relativePath === `${baseSegment}/${versionId}` || relativePath.startsWith(`${baseSegment}/${versionId}/`))
}
