import { describe, expect, it } from 'vitest'
import { COMMAND_RE, getCommand } from '../src/markdown/highlighter'

describe('code commands', () => {
  it('highlight', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1,4]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:1,10]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:12,123]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:-12,123]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:-23,-123]')).toBeTruthy()

    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:a,10]')).toBeFalsy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:10,a]')).toBeFalsy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:b,a]')).toBeFalsy()

    expect(COMMAND_RE.exec('const foo = 1 // [svp! hl:-23,-123]')).toMatchInlineSnapshot(`
      [
        "// [svp! hl:-23,-123]",
        "hl:-23,-123",
        ":-23,-123",
        ",-123",
      ]
    `)

    expect(getCommand('const foo = 1 // [svp! hl:1,10]')).toMatchInlineSnapshot(`
      [
        "hl:1,10",
        "const foo = 1 ",
      ]
    `)
  })
})
