import { describe, expect, it } from 'vitest'
import { normalizeVitePreloadPaths } from '../src/utils/preload-paths'

describe('normalizeVitePreloadPaths', () => {
  it('rewrites SvelteKit preload deps to absolute paths', () => {
    const code = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./_app/immutable/nodes/0.js",'./_app/immutable/assets/Expansion.css'])))=>i.map(i=>d[i])`

    expect(normalizeVitePreloadPaths(code)).toBe(`const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["/_app/immutable/nodes/0.js",'/_app/immutable/assets/Expansion.css'])))=>i.map(i=>d[i])`)
  })

  it('leaves already absolute preload deps unchanged', () => {
    const code = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["/_app/immutable/chunks/app.js"])))=>i.map(i=>d[i])`

    expect(normalizeVitePreloadPaths(code)).toBe(code)
  })

  it('does not rewrite non-preload strings', () => {
    const code = `const docs = "./_app/immutable/example.js"`

    expect(normalizeVitePreloadPaths(code)).toBe(code)
  })
})
