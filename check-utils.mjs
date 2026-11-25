import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_PACKAGES_DIR = fileURLToPath(new URL('./packages', import.meta.url))

/**
 * Every workspace package changesets can publish, read from the filesystem so
 * a newly added package is covered without editing a list.
 *
 * Private packages (the docs site, examples) are left out: changesets does not
 * version them. Directories without a readable package.json are skipped.
 */
export function getPublishablePackageNames(packagesDir = DEFAULT_PACKAGES_DIR) {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map((entry) => {
      try {
        return JSON.parse(readFileSync(join(packagesDir, entry.name, 'package.json'), 'utf8'))
      }
      catch {
        return null
      }
    })
    .filter(pkg => pkg && typeof pkg.name === 'string' && !pkg.private)
    .map(pkg => pkg.name)
    .sort()
}

/** A changeset that gives each named package a patch bump. */
export function buildChangesetContent(packageNames, summary = 'chore: update deps') {
  const bumps = packageNames.map(name => `'${name}': patch`).join('\n')
  return `---\n${bumps}\n---\n\n${summary}\n`
}

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function hasPrebuiltIconifyIcon(source, collection, name) {
  const match = source.match(new RegExp(`['"]${escapeRegExp(collection)}['"]\\s*:\\s*\\[([^\\]]*)]`))
  if (!match)
    return false
  return new RegExp(`['"]${escapeRegExp(name)}['"]`).test(match[1])
}
