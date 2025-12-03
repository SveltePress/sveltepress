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

  it('with backticks', async () => {
    const { code } = await mdToSvelte({
      mdContent: 'To create a string in JS, write something like: `` `red` ``.',
      filename: 'inline-code-with-backticks.md',
    })
    expect(code).toMatchInlineSnapshot(`"<p>To create a string in JS, write something like: <code>{\`\\\`red\\\`\`}</code>.</p>"`)
  })

  it('with backslashes', async () => {
    const { code } = await mdToSvelte({
      mdContent: '`C:\\Users\\test\\path`',
      filename: 'inline-code-with-backslashes.md',
    })
    expect(code).toMatchInlineSnapshot(`"<p><code>{\`C:\\\\Users\\\\test\\\\path\`}</code></p>"`)
  })
})
