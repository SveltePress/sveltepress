import { describe, expect, it } from 'vitest'
import { COMMAND_RE, getCommand } from '../src/markdown/commands'

describe('code commands', () => {
  it('highlight', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1,4]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1,10]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:12,123]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:-12,123]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:-23,-123]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! ~~:-23,-123]')).toBeTruthy()

    expect(COMMAND_RE.exec('const foo = 1 // [svp! hl:-23,-123]')).toMatchInlineSnapshot(`
      [
        "// [svp! hl:-23,-123]",
        "hl",
        "hl",
        undefined,
        undefined,
        undefined,
        undefined,
        ":-23,-123",
      ]
    `)

    expect(getCommand('const foo = 1 // [svp! ~~:1,10]')).toMatchInlineSnapshot(`
      [
        "~~:1,10",
        "const foo = 1 ",
      ]
    `)
  })

  it('diff', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! df]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df:+]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df:-]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! ++]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! --]')).toBeTruthy()

    expect(getCommand('const foo = 1 // [svp! ++]')).toMatchInlineSnapshot(`
      [
        "++",
        "const foo = 1 ",
      ]
    `)
  })
})
