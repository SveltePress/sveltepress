import { describe, expect, it } from 'vitest'
import { parsePost } from '../src/parse-post.js'

const MINIMAL = `---
title: Hello World
date: 2026-04-10
---
This is the **body** of the post.
`

const FULL = `---
title: Full Post
date: 2026-04-08
cover: /img/cover.jpg
tags: [Svelte, Performance]
category: Engineering
excerpt: Custom excerpt text.
author: Alice
draft: false
---
# Section

Some content here for reading time.
`

const DRAFT = `---
title: Draft Post
date: 2026-04-01
draft: true
---
Draft body.
`

describe('parsePost', () => {
  it('parses minimal frontmatter', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.slug).toBe('hello-world')
    expect(result.title).toBe('Hello World')
    expect(result.date).toBe('2026-04-10')
    expect(result.tags).toEqual([])
    expect(result.readingTime).toBe(1)
  })

  it('auto-extracts excerpt from body when not in frontmatter', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.excerpt).toBe('This is the body of the post.')
  })

  it('uses explicit excerpt when provided', async () => {
    const result = await parsePost('full-post', FULL)
    expect(result.excerpt).toBe('Custom excerpt text.')
  })

  it('parses all optional fields', async () => {
    const result = await parsePost('full-post', FULL)
    expect(result.cover).toBe('/img/cover.jpg')
    expect(result.tags).toEqual(['Svelte', 'Performance'])
    expect(result.category).toBe('Engineering')
    expect(result.author).toBe('Alice')
  })

  it('renders contentHtml', async () => {
    const result = await parsePost('hello-world', MINIMAL)
    expect(result.contentHtml).toContain('<strong>body</strong>')
  })

  it('returns draft flag', async () => {
    const result = await parsePost('draft-post', DRAFT)
    expect(result.draft).toBe(true)
  })
})
