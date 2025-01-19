import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '../../src/'

describe('inline-codes', () => {
  it('with { and }', async () => {
    const { code } = await mdToSvelte({
      mdContent: `
\`{}\`
`,
      filename: 'inline-code-with-brackets.md',
    })
    expect(code).toMatchInlineSnapshot(`"<p><code>{\`{}\`}</code></p>"`)
  })
})
