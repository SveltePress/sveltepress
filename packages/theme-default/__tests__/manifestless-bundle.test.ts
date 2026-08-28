import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stripVersioningForManifestlessSite } from '../src/vite-plugins/strip-versioning'

const baselineHashes = {
  'ActionButton.svelte': 'bca18b81ffc519b9c94abfe42ead195b79c0d5176f6318989dd33176cff7bd29',
  'EditPage.svelte': '2a0306ec4d38db77472b415854e8fef9bf5779f8bbfe24ba7ce19c68bb5afd35',
  'GlobalLayout.svelte': '9eb2fce8606e3383ec56a37b3111ce57fea291f82fde19bfe4dcf3a2edbd37a2',
  'Link.svelte': '965fa5dbeeb491742732101efb9e6cd5e5e4cda0d861451e03519c200917020a',
  'Logo.svelte': 'f85dbe0257f28164c30d9369f16a57d3311feadf57a7dc5c99934ce868007058',
  'NavItem.svelte': '9278590e13404cffd0dfb5a5dc40f19fd7524b45bdcb99639ed9018f7d4fea03',
  'Navbar.svelte': 'b37096f4090adcbfccd65a0116a1d05cdad3141ad37a091b7decb7097bbf036c',
  'NavbarMobile.svelte': '62f730502d6015f7cc6dd0ab88820148bff0a517951f34a3a5a295eb9f87a19f',
  'PageLayout.svelte': '825126031cf2113d3abedfa59247938aa6ccfd15b0cf5389c84b46bb42f3ac0a',
  'layout.ts': '14406f3500c45be5085c3e7f5bc156542aa896cf9f7a6cc0acfafa1ae8f994b5',
  'pwa/sw.js': '34531cfb59de917b1ebf006b4928ab744cdd24f755a9666872f62f7bf41911b3',
}

describe('manifestless default theme', () => {
  it('restores every affected client source to the fixed pre-versioning baseline', () => {
    for (const [name, expectedHash] of Object.entries(baselineHashes)) {
      const path = resolve(import.meta.dirname, `../src/components/${name}`)
      const source = readFileSync(path, 'utf8')
      const stripped = stripVersioningForManifestlessSite(source, path)
      expect(stripped, name).not.toBeNull()
      expect(createHash('sha256').update(stripped!).digest('hex'), name).toBe(expectedHash)
    }
  })
})
