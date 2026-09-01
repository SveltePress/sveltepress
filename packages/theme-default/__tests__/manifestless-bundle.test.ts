import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'

const reviewedManifestlessHashes = {
  'ActionButton.svelte': 'bca18b81ffc519b9c94abfe42ead195b79c0d5176f6318989dd33176cff7bd29',
  'EditPage.svelte': '37cb8f0bffd3abb9df65db87f7730dd7528f7c95cdd30af762703d765bf663fb',
  'GlobalLayout.svelte': '1e4ae5370711370f4c58290959f34a7192907eea63e62ff05a89564dad1dd7ec',
  'Link.svelte': '8c109b2b40606e9667ebd3e5aa026c3169c2db72bebd1c994df1f778f5560877',
  'Logo.svelte': 'd2074801f9c08eb1e934cf304ac14e7d0845012d99ccd0e023a8be372f07aedc',
  'NavItem.svelte': 'ecd90633c65dbdd4261dcb36beb62c90de9130ec5f79a551773d36f6526f6fd2',
  'Navbar.svelte': 'fd1bad05d81e8ff83684f3e69a533d9d0b8eeac02641c76e8d7f11c18dc96386',
  'NavbarMobile.svelte': 'f5a6b7f084e0d8e735ec4e24014d15ca9feaa33b8bfc3a0a6a731a021e1b19e5',
  'PageLayout.svelte': 'bcb193cb166a1b3577f08a953f08fbf5fd58b6bc5447892de9315e45d2ae5012',
  'SidebarGroup.svelte': 'b08bd556224b1a4cac60d1e2a857ebb668bdcbf3e90bb7a75018cb19af4a41d5',
  'Toc.svelte': 'b260bce61dc3ce8af1c7fbb7d5f6e08f24c1df15dc3f91f6ef77f45253c93775',
  'layout.ts': '9580b794152ceb15e4488f27583b6ae83dcbfab752289d84301b9e8632fc5a31',
  'pwa/sw.js': '34531cfb59de917b1ebf006b4928ab744cdd24f755a9666872f62f7bf41911b3',
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
})
