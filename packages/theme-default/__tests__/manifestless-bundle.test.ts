import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'

const reviewedManifestlessHashes = {
  'ActionButton.svelte': '277fecc0f7d607e5bd9000153f6d171dc62ae895d8305bacb3a16ff898d24bc1',
  'EditPage.svelte': '37cb8f0bffd3abb9df65db87f7730dd7528f7c95cdd30af762703d765bf663fb',
  'GlobalLayout.svelte': 'ee9a313a6ff4ffab9a64068b8c2edf336382acb87a5c503759ac1a0e983eb232',
  'Link.svelte': '8c109b2b40606e9667ebd3e5aa026c3169c2db72bebd1c994df1f778f5560877',
  'Logo.svelte': 'd2074801f9c08eb1e934cf304ac14e7d0845012d99ccd0e023a8be372f07aedc',
  'NavItem.svelte': '55a2261ab9eaa4858b9a8ce1eddb71509315f8f1992db34ba4a8d225907e1e13',
  'Navbar.svelte': '4337f912f18550852e9c5eec49a67d95bdbf388f58870840383274951030f8d4',
  'NavbarMobile.svelte': 'f5a6b7f084e0d8e735ec4e24014d15ca9feaa33b8bfc3a0a6a731a021e1b19e5',
  'PageLayout.svelte': '7aa8ffdade12106bb14841305e8ba07518505fef2ecfcc4e12938f77829b9637',
  'SidebarGroup.svelte': '2277d6c145cdd6222033df26ef1c488ef250b94a142705b33ddea38afe158db1',
  'Toc.svelte': 'b260bce61dc3ce8af1c7fbb7d5f6e08f24c1df15dc3f91f6ef77f45253c93775',
  'layout.ts': '430ecf785cf02871acc04e3de954e37b92a0c2c4586329bef610b4a794df2eb9',
  'pwa/sw.js': 'f750090ff5156db51fc141494ffedc8acfa947cc4440985f8759af2182d6d513',
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
