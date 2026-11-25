import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Offline half of the scaffolding guard. The end to end run (pack, install the
// tarball with npm, scaffold, install, build) lives in
// .github/workflows/create-smoke.yml.

const createDir = fileURLToPath(new URL('../../packages/create', import.meta.url))
const templates = ['template-js', 'template-ts']

function readManifest(...segments: string[]) {
  return JSON.parse(readFileSync(join(createDir, ...segments, 'package.json'), 'utf8'))
}

/**
 * Paths inside the tarball npm would publish.
 *
 * `--ignore-scripts` is deliberate: `prepare` builds the package, and that
 * build rewrites both template manifests. Listing the tarball must leave the
 * working tree alone.
 */
function packedFiles(): string[] {
  const output = execFileSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: createDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  )
  const [{ files }] = JSON.parse(output) as [{ files: { path: string }[] }]
  return files.map(file => file.path)
}

function pnpmOnlySpecifiers(dependencies: Record<string, string> = {}) {
  return Object.entries(dependencies)
    .filter(([, range]) => range.startsWith('catalog:') || range.startsWith('workspace:'))
    .map(([name, range]) => `${name}: ${range}`)
}

describe('the published create package', () => {
  let files: string[] = []

  beforeAll(() => {
    files = packedFiles()
  })

  it.each(templates)('ships %s with its ignore file under a name npm keeps', (template) => {
    // npm never packs a file named `.gitignore`. A template that carries one is
    // published without it, and every scaffolded project then starts out
    // tracking node_modules and build output. `_gitignore` survives packing and
    // the CLI renames it while copying.
    expect(existsSync(join(createDir, template, '.gitignore'))).toBe(false)
    expect(files).toContain(`${template}/_gitignore`)
  })

  it('installs with npm', () => {
    // Consumers resolve these with their own package manager, so a pnpm
    // protocol here breaks `npm create @sveltepress`.
    expect(pnpmOnlySpecifiers(readManifest().dependencies)).toEqual([])
  })
})

describe.each(templates)('%s', (template) => {
  const manifest = readManifest(template)

  it('does not pin a package manager', () => {
    // Corepack refuses to run Yarn in a project whose `packageManager` names
    // pnpm, and the create command is documented for npm, Yarn, pnpm and Bun.
    expect(manifest.packageManager).toBeUndefined()
  })

  it('states the Node.js floor of the SvelteKit major it installs', () => {
    // SvelteKit 3 needs Node.js >=22.17. When the template moves to another
    // SvelteKit major, look the floor up again instead of editing this range.
    expect(manifest.devDependencies['@sveltejs/kit']).toMatch(/^\^3\./)
    expect(manifest.engines?.node).toBe('>=22.17')
  })

  it('uses no specifier that only pnpm understands', () => {
    expect(pnpmOnlySpecifiers({
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.peerDependencies,
    })).toEqual([])
  })

  it('carries no lockfile', () => {
    // A lockfile in a template pins every scaffolded project to the versions
    // that were current when it was committed, whatever package.json says.
    const lockfiles = readdirSync(join(createDir, template))
      .filter(entry => /^(?:package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/.test(entry))
    expect(lockfiles).toEqual([])
  })
})

describe('a scaffolded project', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'sveltepress-create-'))

  afterAll(() => {
    rmSync(scratch, { recursive: true, force: true })
  })

  function scaffold(template: 'js' | 'ts') {
    const name = `app-${template}`
    execFileSync(
      process.execPath,
      [join(createDir, 'index.js'), name, '-t', template],
      { cwd: scratch, stdio: 'ignore' },
    )
    return join(scratch, name)
  }

  it.each(['js', 'ts'] as const)('gets a .gitignore from the %s template', (template) => {
    const project = scaffold(template)

    expect(existsSync(join(project, '_gitignore'))).toBe(false)
    expect(readFileSync(join(project, '.gitignore'), 'utf8')).toMatch(/^node_modules$/m)
    expect(JSON.parse(readFileSync(join(project, 'package.json'), 'utf8')).name).toBe(`app-${template}`)
  })
})
