import { fromMarkdown } from 'mdast-util-from-markdown'
import { toHast } from 'mdast-util-to-hast'
import { describe, expect, it } from 'vitest'

const md = `
\`\`\`md live no-ast
<Floating placement="top">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    Trigger
  </div>

  {#snippet floatingContent()}
    <div class="bg-white dark:bg-dark b-solid b-1 b-red rounded p-4">
      Floating content
    </div>
  {/snippet}
</Floating>
\`\`\`
`

describe('md', async () => {
  it('base code block', async () => {
    const mdast = fromMarkdown(md)
    await expect(JSON.stringify(mdast, null, 2)).toMatchFileSnapshot('code-block-mdast.snap.json')
    const hast = toHast(mdast, {
    })
    await expect(JSON.stringify(hast, null, 2)).toMatchFileSnapshot('code-block-hast.json')
  })
})
