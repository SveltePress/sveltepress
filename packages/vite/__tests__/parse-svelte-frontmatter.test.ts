import { describe, expect, it } from 'vitest'
import { parseSvelteFrontmatter } from '../src/utils/parseSvelteFrontmatter'

describe('parse svelte frontmatter', () => {
  it('simple', async () => {
    expect(parseSvelteFrontmatter(`
<script context="module">
  export const frontmatter = {
    title: 'some title'
  }
</script>`)).toMatchSnapshot()
  })

  it('array', async () => {
    expect(parseSvelteFrontmatter(`
<script context="module">
  export const frontmatter = {
    arr: [1, 2, 3]
  }
</script>`)).toMatchSnapshot()
  })

  it('object', async () => {
    expect(parseSvelteFrontmatter(`
<script context="module">
  export const frontmatter = {
    obj: {
      foo: 'bar'
    }
  }
</script>`)).toMatchSnapshot()
  })

  it('nested', async () => {
    expect(parseSvelteFrontmatter(`
<script context="module">
  export const frontmatter = {
    title: 'some title',
    num: 1,
    arr: [1, 2, { nestedObj: {
      foo: 'bar'
    } }],
    obj: {
      nestedArr: [1, 2, 3],
      nestedObj2: {
        a: 'a'
      }
    }
  }
</script>`)).toMatchSnapshot()
  })
})
