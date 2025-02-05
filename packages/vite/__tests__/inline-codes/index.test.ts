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

  it('with < and >', async () => {
    const { code } = await mdToSvelte({
      mdContent: `
\`you know 1 < 2 ? >\`
`,
      filename: 'inline-code-with-angle-brackets.md',
    })
    expect(code).toMatchInlineSnapshot(`"<p><code>{\`you know 1 < 2 ? >\`}</code></p>"`)
  })
})
