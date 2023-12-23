import { describe, expect, it } from 'vitest'
import { COMMAND_RE, processCommands } from '../src/markdown/commands'

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
    expect(processCommands('const foo = 1 // [svp! ++] // [svp! !!:3] // [svp! ~~]', 0, 1)).toMatchInlineSnapshot(`
      [
        [
          "<div class="svp-code-block--command-line svp-code-block--diff-bg-add"  style="top: calc(0em + 12px);"><div class="svp-code-block--diff-add">+</div></div>",
          "<div class="svp-code-block--focus" style="top: 0;height: calc(12px + 0em);"></div>
      <div class="svp-code-block--focus" style="top: calc(12px + 4.5em);height: calc(12px + -3em);"></div>",
          "<div class="svp-code-block--command-line svp-code-block--hl"  style="top: calc(0em + 12px);"></div>",
        ],
        "const foo = 1   ",
      ]
    `)
  })
})
