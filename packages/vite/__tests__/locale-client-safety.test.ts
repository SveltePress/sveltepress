import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * The `virtual:sveltepress/locale` virtual module is generated for client
 * code, so `src/locale.ts` must never import Node.js built-ins. A regression
 * here (node:fs in the client bundle) crashes hydration with
 * "Module 'node:fs' has been externalized for browser compatibility" and
 * SvelteKit renders the 500 error page. Build-time filesystem scanning lives
 * in `src/locale-scan.ts` instead.
 */
function staticImportsOf(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const imports: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier))
      imports.push(node.moduleSpecifier.text)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

describe('client-safe locale module', () => {
  const localeFile = join(__dirname, '../src/locale.ts')
  const localeScanFile = join(__dirname, '../src/locale-scan.ts')

  it('keeps Node.js built-ins out of the client locale module', () => {
    const imports = staticImportsOf(localeFile)
    const nodeBuiltins = imports.filter(specifier => specifier.startsWith('node:'))
    expect(nodeBuiltins).toEqual([])
    expect(imports).not.toContain('node:fs')
    expect(imports).not.toContain('node:path')
  })

  it('moves filesystem scanning to the build-time locale-scan module', () => {
    const imports = staticImportsOf(localeScanFile)
    expect(imports).toContain('node:fs')
    expect(imports).toContain('node:path')
  })
})
