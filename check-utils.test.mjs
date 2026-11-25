import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

import {
  buildChangesetContent,
  getChangesetFilename,
  getPublishablePackageNames,
  hasPrebuiltIconifyIcon,
  isHistoricalVersionRoute,
} from './check-utils.mjs'

it('lists every package the workspace publishes for the dependency update changeset', () => {
  // The list used to be written by hand and missed four packages, so their
  // dependency updates never reached npm.
  const packagesDir = fileURLToPath(new URL('./packages', import.meta.url))
  const published = readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap((entry) => {
      try {
        const manifest = JSON.parse(readFileSync(join(packagesDir, entry.name, 'package.json'), 'utf8'))
        return manifest.private ? [] : [manifest.name]
      }
      catch {
        return []
      }
    })
    .sort()

  expect(getPublishablePackageNames()).toEqual(published)
  expect(getPublishablePackageNames()).toEqual(expect.arrayContaining([
    '@sveltepress/cli',
    '@sveltepress/create',
    '@sveltepress/docsearch',
    '@sveltepress/meilisearch',
    '@sveltepress/theme-blog',
    '@sveltepress/theme-default',
    '@sveltepress/twoslash',
    '@sveltepress/vite',
  ]))
})

it('leaves out private packages and directories that are not packages', () => {
  const packagesDir = mkdtempSync(join(tmpdir(), 'sveltepress-packages-'))
  for (const [dir, manifest] of [
    ['published', '{ "name": "@scope/published", "version": "1.0.0" }'],
    ['docs', '{ "name": "@scope/docs", "private": true }'],
    ['broken', '{ not json'],
    ['unnamed', '{ "version": "1.0.0" }'],
  ]) {
    mkdirSync(join(packagesDir, dir))
    writeFileSync(join(packagesDir, dir, 'package.json'), manifest)
  }
  mkdirSync(join(packagesDir, 'leftover-build-output'))

  expect(getPublishablePackageNames(packagesDir)).toEqual(['@scope/published'])
})

it('writes a changeset that gives each package a patch bump', () => {
  expect(buildChangesetContent(['@scope/a', '@scope/b'])).toBe(`---
'@scope/a': patch
'@scope/b': patch
---

chore: update deps
`)
})

it('formats dependency update changeset filename with the local date prefix', () => {
  const filename = getChangesetFilename(new Date(2026, 4, 5))

  expect(filename).toBe('2026-05-05-update-deps.md')
})

it('recognizes only manifest-declared historical route trees', () => {
  expect(isHistoricalVersionRoute('v/8.1/guide/+page.md', '/v', ['8.1'])).toBe(true)
  expect(isHistoricalVersionRoute('v/8.10/guide/+page.md', '/v', ['8.1'])).toBe(false)
  expect(isHistoricalVersionRoute('guide/+page.md', '/v', ['8.1'])).toBe(false)
})

it('finds a prebuilt Iconify icon even when the collection lists extra names', () => {
  const source = `
    preBuildIconifyIcons: {
      'material-symbols': ['history', 'translate', 'search'],
    }
  `

  expect(hasPrebuiltIconifyIcon(source, 'material-symbols', 'history')).toBe(true)
  expect(hasPrebuiltIconifyIcon(source, 'material-symbols', 'translate')).toBe(true)
  expect(hasPrebuiltIconifyIcon(source, 'material-symbols', 'search')).toBe(true)
  expect(hasPrebuiltIconifyIcon(source, 'material-symbols', 'palette')).toBe(false)
  expect(hasPrebuiltIconifyIcon(source, 'logos', 'history')).toBe(false)
})
