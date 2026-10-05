import { createHash } from 'node:crypto'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { get } from 'svelte/store'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'
import themeOptions from './fixtures/theme-options'

const reviewedManifestlessHashes = {
  'ActionButton.svelte': '277fecc0f7d607e5bd9000153f6d171dc62ae895d8305bacb3a16ff898d24bc1',
  'EditPage.svelte': '37cb8f0bffd3abb9df65db87f7730dd7528f7c95cdd30af762703d765bf663fb',
  'GlobalLayout.svelte': 'a6cc7fbc9c615fb8dc3c316a717c372d9399660520bd4f1d3c3add16d777c6a3',
  'Link.svelte': '8c109b2b40606e9667ebd3e5aa026c3169c2db72bebd1c994df1f778f5560877',
  'Logo.svelte': 'd2074801f9c08eb1e934cf304ac14e7d0845012d99ccd0e023a8be372f07aedc',
  'NavItem.svelte': '55a2261ab9eaa4858b9a8ce1eddb71509315f8f1992db34ba4a8d225907e1e13',
  'Navbar.svelte': '18dafff571573bb4672445719c6a79c49bfcc41852346971b32363c8d2447f85',
  'NavbarMobile.svelte': 'f5a6b7f084e0d8e735ec4e24014d15ca9feaa33b8bfc3a0a6a731a021e1b19e5',
  'PageLayout.svelte': '2eb05d9b0611dbe9a0c3049cfe60a4976805ad159fa15106bd97ee7e4b5ee471',
  'SidebarGroup.svelte': '5c30e45e371b667aac36e65be5c950e4368bb79e7e69d4392fab35373652cf1f',
  'Toc.svelte': '1a98b1cc0fa2f717aea66bea1e010f4b9e297230c40045ff6fb5f3109d4fb03d',
  'layout.ts': 'cbf69e9ab693bc103fb6e826005dfdaae1f183dd5a586fd46207b4eacd43232a',
  'pwa/sw.js': '3469249fff0fd12af1b33c65e9f38fb8b27bdbcf2db228a7410ea7b43e049e31',
}

describe('manifestless default theme', () => {
  it('matches every reviewed client source after versioning is stripped', () => {
    for (const [name, expectedHash] of Object.entries(reviewedManifestlessHashes)) {
      const path = resolve(import.meta.dirname, `../src/components/${name}`)
      const source = readFileSync(path, 'utf8')
      const stripped = stripVersioningForManifestlessSite(source, path)
      expect(stripped, name).not.toBeNull()
      expect(createHash('sha256').update(stripped!).digest('hex'), name).toBe(expectedHash)
    }
  })

  it('resolves the most specific sidebar key whatever the declaration order', async () => {
    const path = resolve(import.meta.dirname, '../src/components/layout.ts')
    const stripped = stripVersioningForManifestlessSite(readFileSync(path, 'utf8'), path)!
    // Run the stripped module next to this test, importing the real locale helpers.
    const strippedPath = resolve(import.meta.dirname, '.manifestless-layout.tmp.ts')
    writeFileSync(strippedPath, stripped.replace(`from './locale'`, `from '../src/components/locale'`))
    const originalSidebar = themeOptions.sidebar
    const guide = [{ title: 'Guide', to: '/guide/' }]
    const markdown = [{ title: 'Markdown', to: '/guide/markdown/basic-writing/' }]
    themeOptions.sidebar = { '/guide/': guide, '/guide/markdown/': markdown } as any
    try {
      const layout = await import(/* @vite-ignore */ strippedPath)
      layout.resolveSidebar('/guide/markdown/basic-writing')
      expect(get(layout.resolvedSidebar)).toEqual(markdown)
      layout.resolveSidebar('/guide/quick-start')
      expect(get(layout.resolvedSidebar)).toEqual(guide)
    }
    finally {
      themeOptions.sidebar = originalSidebar
      rmSync(strippedPath, { force: true })
    }
  })
})
