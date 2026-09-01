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
  'SidebarGroup.svelte': '2277d6c145cdd6222033df26ef1c488ef250b94a142705b33ddea38afe158db1',
  'Toc.svelte': 'b260bce61dc3ce8af1c7fbb7d5f6e08f24c1df15dc3f91f6ef77f45253c93775',
  'layout.ts': '954aa69bef713675ad57cf4747a69cc8ba37cc3e59250d31da6ebf4ef9acd144',
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
