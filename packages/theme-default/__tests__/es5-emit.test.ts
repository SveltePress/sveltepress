import { relative, resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const packageDir = resolve(import.meta.dirname, '..')

// "Type 'Set<string>' can only be iterated through when using the
// '--downlevelIteration' flag or with a '--target' of 'es2015' or higher."
const NOT_ITERABLE_AT_THIS_TARGET = 2802

describe('published build', () => {
  it('iterates nothing the package build cannot iterate', () => {
    // svelte-package emits the .ts sources with the options in tsconfig.json,
    // which sets no target, so they are compiled to ES5. There a `for...of`
    // or a spread over a Set or Map becomes an index loop that never runs:
    // the code works in these tests, which run from source, and silently does
    // nothing once published. TypeScript reports exactly those places.
    const { config } = ts.readConfigFile(resolve(packageDir, 'tsconfig.json'), ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(config, ts.sys, packageDir)
    const program = ts.createProgram({
      rootNames: parsed.fileNames.filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts')),
      options: { ...parsed.options, noEmit: true, skipLibCheck: true },
    })

    const unsafe = ts.getPreEmitDiagnostics(program)
      .filter(diagnostic => diagnostic.code === NOT_ITERABLE_AT_THIS_TARGET && diagnostic.file)
      .map((diagnostic) => {
        const { line } = diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start!)
        return `${relative(packageDir, diagnostic.file!.fileName)}:${line + 1}`
      })

    expect(unsafe, 'use Array.from() or iterate an array at these places').toEqual([])
  })
})
