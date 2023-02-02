import { describe, expect, it } from 'vitest'
import { COMMAND_RE, getCommands } from '../src/markdown/commands'

describe('code commands', () => {
  it('highlight', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:10]')).toBeTruthy()

    expect(COMMAND_RE.exec('const foo = 1 // [svp! hl] // [svp! ++]')).toMatchInlineSnapshot(`
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
  })

  it('diff', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! df]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df:+]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df:-]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! ++]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! --]')).toBeTruthy()

    // expect(getCommands('const foo = 1 // [svp! ++]')).toMatchInlineSnapshot(`
    //   [
    //     [
    //       "++",
    //     ],
    //     "const foo = 1 ",
    //   ]
    // `)
  })

  it('focus', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! fc]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! !!]')).toBeTruthy()

    // expect(getCommands('const foo = 1 // [svp! !!:3]')).toMatchInlineSnapshot(`
    //   [
    //     [
    //       "!!:3",
    //     ],
    //     "const foo = 1 ",
    //   ]
    // `)
  })

  it('multi command', async () => {
    expect(getCommands('const foo = 1 // [svp! ++] // [svp! !!:3] // [svp! ~~]')).toMatchInlineSnapshot(`
      [
        [
          "++",
          "!!:3",
          "~~",
        ],
        "const foo = 1   ",
      ]
    `)
  })
})
