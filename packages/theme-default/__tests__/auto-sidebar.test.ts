import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateSidebar } from '../src/auto-sidebar'

function writePage(dir: string, title: string, extra = '') {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, '+page.md'), `---\ntitle: ${title}\n${extra}---\n`)
}

describe('auto sidebar', () => {
  it('skips frozen and dev-mounted historical version snapshot trees', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-auto-sidebar-'))
    const routesDir = join(root, 'src/routes')

    writePage(join(routesDir, 'guide/version-management'), 'Document versions', 'order: 1\n')
    writePage(join(routesDir, 'guide/version-selector'), 'Version selector', 'order: 2\n')
    writePage(join(routesDir, 'whats-new'), 'What\'s new')

    const snapshot = join(routesDir, 'v/1.0')
    writePage(snapshot, 'Welcome to Sveltepress')
    writePage(join(snapshot, 'guide/version-management'), 'Document versions')
    writeFileSync(join(snapshot, '.sveltepress-version.json'), '{}\n')

    const sidebar = generateSidebar({ enabled: true, routesDir })

    expect(Object.keys(sidebar)).toEqual(['/guide/'])
    expect(sidebar['/guide/']).toEqual([
      { title: 'Document versions', to: '/guide/version-management/' },
      { title: 'Version selector', to: '/guide/version-selector/' },
    ])
    expect(JSON.stringify(sidebar)).not.toContain('/v/')
  })

  it('skips locale-composed version bases and explicit /v/ roots', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-auto-sidebar-locale-'))
    const routesDir = join(root, 'src/routes')

    writePage(join(routesDir, 'zh/guide/introduction'), '介绍')
    const zhSnapshot = join(routesDir, 'zh/v/1.0')
    writePage(zhSnapshot, '历史主页')
    writeFileSync(join(zhSnapshot, '.sveltepress-dev-shell.json'), '{}\n')
    mkdirSync(join(routesDir, 'v'), { recursive: true })
    writeFileSync(join(routesDir, 'v/.sveltepress-generated-shells.json'), '{}\n')
    writePage(join(routesDir, 'v/1.0'), 'Frozen home')

    const detected = generateSidebar({ enabled: true, routesDir })
    expect(Object.keys(detected)).toEqual(['/zh/'])
    expect(detected['/zh/']).toEqual([
      {
        title: 'Guide',
        items: [
          { title: '介绍', to: '/zh/guide/introduction/' },
        ],
      },
    ])
    expect(JSON.stringify(detected)).not.toContain('/v/')

    const explicit = generateSidebar({
      enabled: true,
      routesDir,
      roots: ['/guide/', '/v/', '/zh/'],
    })
    expect(explicit['/v/']).toBeUndefined()
    expect(explicit['/zh/']).toEqual(detected['/zh/'])
  })

  it('builds a versions-starter Guide sidebar without listing /whats-new/ or /v/', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-auto-sidebar-versions-'))
    const routesDir = join(root, 'src/routes')

    writePage(join(routesDir, 'guide/version-management'), 'Document versions', 'order: 1\n')
    writePage(join(routesDir, 'guide/version-selector'), 'Version selector', 'order: 2\n')
    writePage(join(routesDir, 'whats-new'), 'What\'s new')
    writePage(join(routesDir, 'v/1.0/guide/version-management'), 'Document versions')
    writeFileSync(join(routesDir, 'v/1.0/.sveltepress-version.json'), '{}\n')

    const sidebar = generateSidebar({
      enabled: true,
      routesDir,
      roots: ['/guide/'],
    })

    expect(sidebar).toEqual({
      '/guide/': [
        { title: 'Document versions', to: '/guide/version-management/' },
        { title: 'Version selector', to: '/guide/version-selector/' },
      ],
    })
  })
})
