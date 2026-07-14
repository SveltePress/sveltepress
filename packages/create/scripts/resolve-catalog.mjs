// Resolve pnpm `catalog:` specifiers in this package's package.json to concrete
// version ranges (and restore them afterwards).
//
// `@sveltepress/create` is installed by end users through `npm create
// @sveltepress@latest`. npm does not understand pnpm's `catalog:` protocol, so
// a package published with raw `catalog:` dependencies fails with
// `EUNSUPPORTEDPROTOCOL` (see issue #407). `pnpm publish` rewrites `catalog:`
// automatically, but a manual `npm publish` does not — this script makes the
// published tarball correct regardless of the tool used to publish.
//
// Run via the `prepack` (resolve) and `postpack` (restore) lifecycle scripts,
// which run for both `npm publish`/`npm pack` and `pnpm publish`/`pnpm pack`
// but NOT on `install`, so the committed `package.json` keeps `catalog:`.

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const pkgPath = resolve(scriptDir, '../package.json')
const backupPath = resolve(scriptDir, '../package.json.catalog-backup')
const workspacePath = resolve(scriptDir, '../../../pnpm-workspace.yaml')

const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

const unquote = str => str.replace(/^['"]/, '').replace(/['"]$/, '')

/** Parse the default `catalog:` map out of pnpm-workspace.yaml. */
function readCatalog() {
  const lines = readFileSync(workspacePath, 'utf-8').split('\n')
  const catalog = {}
  let inCatalog = false
  for (const line of lines) {
    if (line.trimEnd() === 'catalog:') {
      inCatalog = true
      continue
    }
    if (!inCatalog)
      continue
    // a non-indented, non-empty line ends the catalog block
    if (line.trim() !== '' && !line.startsWith(' '))
      break
    // entries look like `  name: version` (name may be quoted)
    const colon = line.indexOf(':')
    if (colon === -1)
      continue
    const name = unquote(line.slice(0, colon).trim())
    const version = unquote(line.slice(colon + 1).trim())
    if (name && version)
      catalog[name] = version
  }
  return catalog
}

function restore() {
  if (!existsSync(backupPath))
    return
  writeFileSync(pkgPath, readFileSync(backupPath, 'utf-8'))
  rmSync(backupPath)
}

function resolveCatalog() {
  const raw = readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(raw)
  const catalog = readCatalog()

  let changed = false
  for (const field of DEP_FIELDS) {
    const deps = pkg[field]
    if (!deps)
      continue
    for (const [name, specifier] of Object.entries(deps)) {
      if (specifier === 'catalog:' || specifier === 'catalog:default') {
        const version = catalog[name]
        if (!version)
          throw new Error(`[resolve-catalog] "${name}" is not defined in the pnpm-workspace.yaml catalog`)
        deps[name] = version
        changed = true
      }
    }
  }

  if (changed) {
    // keep a backup so `postpack` can put the `catalog:` specifiers back
    writeFileSync(backupPath, raw)
    // preserve trailing newline convention of the original file
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

if (process.argv.includes('--restore'))
  restore()
else
  resolveCatalog()
