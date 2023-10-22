import { describe, expect, it } from 'vitest'
import { parseSvelteFrontmatter } from '../src/utils/parse-svelte-frontmatter'

function wrapFrontmatter(obj: Record<string, any>) {
  return `
<script context="module" lang="ts">
  export const frontmatter: any = ${JSON.stringify(obj)}
</script>
<script lang="ts">
  export let propName: string

  const someVariable = 'some value'
</script>
<h1>
  propName is {propName}
</h1>
`
}

describe('parse svelte frontmatter', () => {
  it('simple', async () => {
    const simpleObj = {
      title: 'some title',
    }
    expect(await parseSvelteFrontmatter(wrapFrontmatter(simpleObj))).toMatchObject(simpleObj)
  })

  const arrObj = {
    arr: [1, 2, 3],
  }

  it('array', async () => {
    expect(await parseSvelteFrontmatter(wrapFrontmatter(arrObj))).toMatchObject(arrObj)
  })

  const objObj = {
    obj: {
      foo: 'bar',
    },
  }

  it('object', async () => {
    expect(await parseSvelteFrontmatter(wrapFrontmatter(objObj))).toMatchObject(objObj)
  })

  const complexObj = {
    title: 'some title',
    num: 1,
    arr: [1, 2, {
      nestedObj: {
        foo: 'bar',
      },
    }],
    obj: {
      nestedArr: [1, 2, 3],
      nestedObj2: {
        a: 'a',
      },
    },
  }

  it('complex object', async () => {
    expect(await parseSvelteFrontmatter(wrapFrontmatter(complexObj))).toMatchObject(complexObj)
  })
})
