import { describe, expect, it } from 'vitest'
import { COMMAND_RE, getCommand } from '../src/markdown/commands'

describe('code commands', () => {
  it('highlight', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:10]')).toBeTruthy()

    expect(COMMAND_RE.exec('const foo = 1 // [svp! hl]')).toMatchInlineSnapshot(`
      [
        "// [svp! hl]",
        "hl",
        "hl",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ]
    `)

    expect(getCommand('const foo = 1 // [svp! hl]')).toMatchInlineSnapshot(`
      [
        "hl",
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

  it('focus', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! fc]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! !!]')).toBeTruthy()

    expect(getCommand('const foo = 1 // [svp! fc]')).toMatchInlineSnapshot(`
      [
        "fc",
        "const foo = 1 ",
      ]
    `)
  })
})
