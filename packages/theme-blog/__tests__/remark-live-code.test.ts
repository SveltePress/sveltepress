import { beforeAll, describe, expect, it } from 'vitest'
import { buildIndex } from '../src/build-index.js'
import { initHighlighter } from '../src/highlighter.js'
import { parsePost } from '../src/parse-post.js'

const POST = `---
title: Live
date: 2026-11-05
---
Before.

\`\`\`svelte live title="Button.svelte"
<button class="btn">Hi</button>
\`\`\`

\`\`\`svelte live collapsed
<p>collapsed</p>
\`\`\`

\`\`\`svelte
<p>not live</p>
\`\`\`
`

describe('remark-live-code', () => {
  beforeAll(async () => {
    await initHighlighter()
  })

  it('collects each live block and leaves a demo placeholder above its source', async () => {
    const post = await parsePost('live', POST, { liveCodeLabel: '查看代码' })
    expect(post.liveCode).toHaveLength(2)
    expect(post.liveCode[0].code).toBe('<button class="btn">Hi</button>')
    expect(post.liveCode[0].id).toMatch(/^[0-9a-f]{16}$/)

    const html = post.contentHtml
    expect(html).toContain(`data-live="${post.liveCode[0].id}"`)
    expect(html).toContain(`data-live="${post.liveCode[1].id}"`)
    // Source is highlighted, keeps its title, and is open unless `collapsed`.
    expect(html).toContain('<details class="sp-live-code__source" open><summary>查看代码</summary>')
    expect(html).toContain('<details class="sp-live-code__source"><summary>查看代码</summary>')
    expect(html).toContain('Button.svelte')
    expect(html.indexOf('data-live')).toBeLessThan(html.indexOf('shiki'))
    // A plain svelte block stays a plain code block.
    expect(html.match(/sp-live-code__demo/g)).toHaveLength(2)
  })

  it('keeps live code sources out of the per-post record', async () => {
    const post = await parsePost('live', POST)
    const idx = buildIndex([post])
    expect('liveCode' in idx.posts[0]).toBe(false)
    expect(post.contentHtml).toContain('<summary>View code</summary>')
  })
})
