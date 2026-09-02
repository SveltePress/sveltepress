import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'

const reviewedManifestlessHashes = {
  'ActionButton.svelte': 'bca18b81ffc519b9c94abfe42ead195b79c0d5176f6318989dd33176cff7bd29',
  'EditPage.svelte': '37cb8f0bffd3abb9df65db87f7730dd7528f7c95cdd30af762703d765bf663fb',
  'GlobalLayout.svelte': 'f471a31a701f065a35d959afcc00d496abe950b44422f62335b59cc484dd72c4',
  'Link.svelte': '8c109b2b40606e9667ebd3e5aa026c3169c2db72bebd1c994df1f778f5560877',
  'Logo.svelte': 'd2074801f9c08eb1e934cf304ac14e7d0845012d99ccd0e023a8be372f07aedc',
  'NavItem.svelte': '0367e41eb5e0ba16c37d6b73406ad86f9a86713f6f07ad8829ae569aaaa959b5',
  'Navbar.svelte': '0e81fe93680c7eb51f5dad7031a991636a9217b0ef7f366da88099cf0351a116',
  'NavbarMobile.svelte': 'f5a6b7f084e0d8e735ec4e24014d15ca9feaa33b8bfc3a0a6a731a021e1b19e5',
  'PageLayout.svelte': '0becc9d2d3edc028a352ccff02581db7ac194425351a6530b1063759eb719889',
  'SidebarGroup.svelte': '2277d6c145cdd6222033df26ef1c488ef250b94a142705b33ddea38afe158db1',
  'Toc.svelte': 'b260bce61dc3ce8af1c7fbb7d5f6e08f24c1df15dc3f91f6ef77f45253c93775',
  'layout.ts': 'be00d8ed318247be46737357bb12ca84c337773076964bf95a14337561c90f4a',
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
