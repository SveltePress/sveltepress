import { describe, expect, it } from 'vitest'
import { COMMAND_RE, processCommands } from '../src/highlight/commands'

describe('code commands', () => {
  it('detects highlight command', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! hl:10]')).toBeTruthy()
  })

  it('detects diff commands', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! ++]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! --]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! df]')).toBeTruthy()
  })

  it('detects focus commands', () => {
    expect(COMMAND_RE.test('const foo = 1 // [svp! fc]')).toBeTruthy()
    expect(COMMAND_RE.test('const foo = 1 // [svp! !!]')).toBeTruthy()
  })

  it('does not match non-commands', () => {
    expect(COMMAND_RE.test('const foo = 1')).toBeFalsy()
    expect(COMMAND_RE.test('// normal comment')).toBeFalsy()
  })

  it('processCommands strips command and returns overlay HTML', () => {
    const [doms, newLine] = processCommands('const foo = 1 // [svp! hl]', 0, 5)
    expect(newLine).toBe('const foo = 1 ')
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--hl')
    expect(doms[0]).toContain('top: calc(0em + 12px)')
  })

  it('highlight with count', () => {
    const [doms, newLine] = processCommands('const x = 1 // [svp! hl:3]', 2, 10)
    expect(newLine).toBe('const x = 1 ')
    expect(doms).toHaveLength(3)
    expect(doms[0]).toContain('top: calc(3em + 12px)') // line 2
    expect(doms[1]).toContain('top: calc(4.5em + 12px)') // line 3
    expect(doms[2]).toContain('top: calc(6em + 12px)') // line 4
  })

  it('diff add', () => {
    const [doms] = processCommands('added // [svp! ++]', 1, 5)
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--diff-bg-add')
    expect(doms[0]).toContain('svp-code-block--diff-add')
    expect(doms[0]).toContain('+')
  })

  it('diff remove', () => {
    const [doms] = processCommands('removed // [svp! --]', 1, 5)
    expect(doms).toHaveLength(1)
    expect(doms[0]).toContain('svp-code-block--diff-bg-sub')
    expect(doms[0]).toContain('svp-code-block--diff-sub')
    expect(doms[0]).toContain('-')
  })

  it('focus', () => {
    const [doms] = processCommands('focused // [svp! fc]', 2, 5)
    expect(doms).toHaveLength(1)
    // Focus produces two overlay divs joined by newline
    expect(doms[0]).toContain('svp-code-block--focus')
  })

  it('multiple commands on one line', () => {
    const [doms, newLine] = processCommands(
      'const foo = 1 // [svp! ++] // [svp! ~~]',
      0,
      1,
    )
    expect(newLine).toBe('const foo = 1  ')
    expect(doms).toHaveLength(2)
  })
})
