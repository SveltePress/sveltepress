import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'

const reviewedManifestlessHashes = {
  'ActionButton.svelte': 'bca18b81ffc519b9c94abfe42ead195b79c0d5176f6318989dd33176cff7bd29',
  'EditPage.svelte': '2a0306ec4d38db77472b415854e8fef9bf5779f8bbfe24ba7ce19c68bb5afd35',
  'GlobalLayout.svelte': '4f8a9eb022c19014d2655904fae2a86e5af1212e0c376347e34ca92106142986',
  'Link.svelte': '965fa5dbeeb491742732101efb9e6cd5e5e4cda0d861451e03519c200917020a',
  'Logo.svelte': 'f85dbe0257f28164c30d9369f16a57d3311feadf57a7dc5c99934ce868007058',
  'NavItem.svelte': '9278590e13404cffd0dfb5a5dc40f19fd7524b45bdcb99639ed9018f7d4fea03',
  'Navbar.svelte': 'ca365c97d23cde2b729d3da572ea929b42a54eefdb9e4f42c2458b38b7d4f87a',
  'NavbarMobile.svelte': 'b257abd92d303544f61e918657a9029fe0d307686444eceda6ce7562cc9d8d23',
  'PageLayout.svelte': 'c51bd40ec9b39059ad4cac521d1997d5dd7dc22c2cd4a3c0e793cf0443cc8991',
  'layout.ts': '14406f3500c45be5085c3e7f5bc156542aa896cf9f7a6cc0acfafa1ae8f994b5',
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
