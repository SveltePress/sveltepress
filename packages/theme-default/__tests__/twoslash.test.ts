import { describe, expect, it } from 'vitest'
import highlighter from '../src/markdown/highlighter'

describe('twoslash', () => {
  it('renderer floating svelte', async () => {
    const code = `
const num = 1

const foo = 'bar'

`

    expect(await highlighter(code, 'ts')).toMatchSnapshot()
  })
})
