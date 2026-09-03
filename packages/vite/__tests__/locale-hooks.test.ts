import type { LocalesConfig } from '../src/types'
import { describe, expect, it } from 'vitest'
import { createLocaleHandle } from '../src/hooks'

const testLocales: LocalesConfig = {
  '/': { lang: 'en', label: 'English', theme: {} },
  '/zh/': { lang: 'zh', label: '中文', theme: {} },
  '/bn/': { lang: 'bn', label: 'বাংলা', theme: {} },
}

describe('createLocaleHandle', () => {
  it('replaces <html lang="en"> with active locale language on SSR', async () => {
    const handle = createLocaleHandle(testLocales)

    let transformedHtml = ''
    const resolve = async (_event: any, opts?: any) => {
      transformedHtml = opts?.transformPageChunk({ html: '<!DOCTYPE html><html lang="en"><head></head><body></body></html>' })
      return new Response(transformedHtml)
    }

    await handle({ event: { url: new URL('http://localhost/zh/guide/install') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="zh">')

    await handle({ event: { url: new URL('http://localhost/bn/') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="bn">')

    await handle({ event: { url: new URL('http://localhost/guide/') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="en">')
  })

  it('handles <html> tags without initial lang or with extra attributes', async () => {
    const handle = createLocaleHandle(testLocales)

    let transformedHtml = ''
    const resolve = async (_event: any, opts?: any) => {
      transformedHtml = opts?.transformPageChunk({ html: '<!DOCTYPE html><html class="dark" data-theme="dark"><head></head></html>' })
      return new Response(transformedHtml)
    }

    await handle({ event: { url: new URL('http://localhost/zh/guide') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="zh" class="dark" data-theme="dark">')
  })

  it('replaces existing lang attribute even when preceded by class or other attributes', async () => {
    const handle = createLocaleHandle(testLocales)

    let transformedHtml = ''
    const resolve = async (_event: any, opts?: any) => {
      transformedHtml = opts?.transformPageChunk({ html: '<!DOCTYPE html><html class="dark" lang="en"><head></head></html>' })
      return new Response(transformedHtml)
    }

    await handle({ event: { url: new URL('http://localhost/zh/guide') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="zh" class="dark">')
    expect(transformedHtml).not.toContain('lang="en"')
  })

  it('supports base path option in createLocaleHandle', async () => {
    const handle = createLocaleHandle(testLocales, { base: '/docs' })

    let transformedHtml = ''
    const resolve = async (_event: any, opts?: any) => {
      transformedHtml = opts?.transformPageChunk({ html: '<html lang="en"></html>' })
      return new Response(transformedHtml)
    }

    await handle({ event: { url: new URL('http://localhost/docs/zh/guide') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="zh">')
  })

  it('falls back to defaultLang for unconfigured paths', async () => {
    const handle = createLocaleHandle(testLocales, { defaultLang: 'en-US' })

    let transformedHtml = ''
    const resolve = async (_event: any, opts?: any) => {
      transformedHtml = opts?.transformPageChunk({ html: '<html lang="en"></html>' })
      return new Response(transformedHtml)
    }

    await handle({ event: { url: new URL('http://localhost/') }, resolve } as any)
    expect(transformedHtml).toContain('<html lang="en">')
  })
})
