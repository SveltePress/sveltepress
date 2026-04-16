import type { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'

export interface OgImageOpts {
  title: string
  subtitle?: string
  theme: { primary: string, bg: string, text: string }
  fontPath?: string
}

const require = createRequire(import.meta.url)
let cachedFont: Uint8Array | null = null

async function loadFont(fontPath?: string): Promise<Uint8Array> {
  if (cachedFont && !fontPath)
    return cachedFont
  const resolved = fontPath
    ?? require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff')
  const buf = await readFile(resolved)
  if (!fontPath)
    cachedFont = buf
  return buf
}

export async function renderOgImage(opts: OgImageOpts): Promise<Buffer> {
  const font = await loadFont(opts.fontPath)

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: opts.theme.bg,
          color: opts.theme.text,
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: '28px',
                color: opts.theme.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '24px',
              },
              children: opts.subtitle ?? '',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '72px',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              },
              children: opts.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                marginTop: 'auto',
                fontSize: '24px',
                color: opts.theme.primary,
              },
              children: '●',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
    },
  )

  const resvg = new Resvg(svg, { background: opts.theme.bg })
  return resvg.render().asPng()
}
