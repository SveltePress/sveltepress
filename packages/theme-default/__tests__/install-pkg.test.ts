import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import installPkg, { pkgRe } from '../src/markdown/install-pkg'
import highlighter from '../src/markdown/highlighter'

describe('install-pkg', () => {
  it('re', () => {
    expect(pkgRe.exec('@install-pkg(foo-bar)')).toMatchInlineSnapshot(`
      [
        "@install-pkg(foo-bar)",
        "foo-bar",
        undefined,
      ]
    `)
    expect(pkgRe.exec('@install-pkg(foo-bar,create)')).toMatchInlineSnapshot(`
      [
        "@install-pkg(foo-bar,create)",
        "foo-bar,create",
        undefined,
      ]
    `)
  })

  it('md', async () => {
    const source = '@install-pkg(@sveltepress/vite,create)'

    const { code } = await mdToSvelte({
      mdContent: source,
      filename: 'install-pkg.md',
      highlighter,
      remarkPlugins: [installPkg],
    })
    expect(code).toMatchSnapshot()
  })
})
