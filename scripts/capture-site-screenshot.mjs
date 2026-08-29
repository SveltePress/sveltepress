#!/usr/bin/env node

import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

export const CAPTURE_LAYOUT = Object.freeze({
  canvas: { width: 2048, height: 1102 },
  desktop: {
    width: 1752,
    height: 890,
    circle: { x: 1561.054, y: 34.788, radius: 910.572 },
  },
  mobile: {
    width: 548,
    height: 979,
    x: 1500,
    y: 123,
    circle: { x: 472.905, y: 50.276, radius: 587.413 },
  },
})

export const STABLE_SVG_TIME_SECONDS = 3

const DEFAULT_URL = 'https://sveltepress.site/'
const DEFAULT_OUTPUT = 'assets/site.png'
const DEFAULT_READY_SELECTOR = 'main h1'
const DEFAULT_TIMEOUT = 30_000
const THEME_STORAGE_KEY = 'SVELTEPRESS_DARK_MODE'
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

const STABLE_CAPTURE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    caret-color: transparent !important;
    transition: none !important;
  }

  html {
    scrollbar-width: none !important;
  }

  ::-webkit-scrollbar {
    display: none !important;
  }
`

const HELP = `Usage: pnpm capture:site-screenshot -- [options]

Options:
  --url <url>               Page to capture (default: ${DEFAULT_URL})
  --output <path>           PNG output (default: ${DEFAULT_OUTPUT})
  --ready-selector <css>    Visible page landmark (default: ${DEFAULT_READY_SELECTOR})
  --timeout <ms>            Per-page timeout (default: ${DEFAULT_TIMEOUT})
  --browser-path <path>     Chromium-compatible browser executable
  -h, --help                Show this help

Environment equivalents:
  SVELTEPRESS_SCREENSHOT_URL
  SVELTEPRESS_SCREENSHOT_OUTPUT
  SVELTEPRESS_SCREENSHOT_READY_SELECTOR
  SVELTEPRESS_SCREENSHOT_TIMEOUT
  SVELTEPRESS_SCREENSHOT_BROWSER_PATH
`

function optionValue(argv, index, option) {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${option} requires a value`)
  }
  return value
}

function positiveInteger(value, name) {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

function httpUrl(value) {
  let parsed
  try {
    parsed = new URL(value)
  }
  catch {
    throw new Error(`--url must be a valid http:// or https:// URL`)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`--url must use http:// or https://`)
  }
  if (parsed.username || parsed.password) {
    throw new Error(`--url must not contain credentials`)
  }
  return parsed.href
}

export function parseArgs(argv, cwd = process.cwd(), env = process.env) {
  const values = {
    browserPath: env.SVELTEPRESS_SCREENSHOT_BROWSER_PATH,
    help: false,
    output: env.SVELTEPRESS_SCREENSHOT_OUTPUT ?? DEFAULT_OUTPUT,
    readySelector:
      env.SVELTEPRESS_SCREENSHOT_READY_SELECTOR ?? DEFAULT_READY_SELECTOR,
    timeout: env.SVELTEPRESS_SCREENSHOT_TIMEOUT ?? DEFAULT_TIMEOUT,
    url: env.SVELTEPRESS_SCREENSHOT_URL ?? DEFAULT_URL,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index]
    if (option === '--') {
      continue
    }
    if (option === '-h' || option === '--help') {
      values.help = true
      continue
    }

    const value = optionValue(argv, index, option)
    index += 1

    if (option === '--url')
      values.url = value
    else if (option === '--output')
      values.output = value
    else if (option === '--ready-selector')
      values.readySelector = value
    else if (option === '--timeout')
      values.timeout = value
    else if (option === '--browser-path')
      values.browserPath = value
    else throw new Error(`Unknown option: ${option}`)
  }

  const result = {
    browserPath: values.browserPath
      ? path.resolve(cwd, values.browserPath)
      : undefined,
    help: values.help,
    output: path.resolve(cwd, values.output),
    readySelector: values.readySelector,
    timeout: positiveInteger(values.timeout, '--timeout'),
    url: httpUrl(values.url),
  }

  if (!result.browserPath)
    delete result.browserPath
  return result
}

export function readPngDimensions(buffer) {
  if (
    !Buffer.isBuffer(buffer)
    || buffer.length < 24
    || !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  ) {
    throw new Error('Output is not a valid PNG')
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

export function assertPngDimensions(buffer, width, height) {
  const actual = readPngDimensions(buffer)
  if (actual.width !== width || actual.height !== height) {
    throw new Error(
      `Expected a ${width}x${height} PNG, received ${actual.width}x${actual.height}`,
    )
  }
  return actual
}

function urlForLog(value) {
  const parsed = new URL(value)
  parsed.search = ''
  parsed.hash = ''
  return parsed.href
}

async function waitForStablePage(page, options) {
  await page.locator(options.readySelector).first().waitFor({
    state: 'visible',
    timeout: options.timeout,
  })

  await page.addStyleTag({ content: STABLE_CAPTURE_CSS })
  await page.waitForFunction(
    () => {
      if (document.fonts && document.fonts.status !== 'loaded')
        return false

      return [...document.images]
        .filter((image) => {
          const bounds = image.getBoundingClientRect()
          return (
            bounds.bottom > 0
            && bounds.right > 0
            && bounds.top < window.innerHeight
            && bounds.left < window.innerWidth
          )
        })
        .every(image => image.complete && image.naturalWidth > 0)
    },
    undefined,
    { timeout: options.timeout },
  )
  await page.waitForTimeout(250)
  await page.evaluate((stableTimeSeconds) => {
    for (const svg of document.querySelectorAll('svg')) {
      if (typeof svg.setCurrentTime === 'function')
        svg.setCurrentTime(stableTimeSeconds)
      if (typeof svg.pauseAnimations === 'function')
        svg.pauseAnimations()
    }
  }, STABLE_SVG_TIME_SECONDS)
}

async function captureViewport(browser, options, theme, viewport) {
  const context = await browser.newContext({
    colorScheme: theme,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    viewport,
  })

  try {
    await context.addInitScript(
      ({ storageKey, themeName }) => {
        window.localStorage.setItem(storageKey, themeName)
      },
      { storageKey: THEME_STORAGE_KEY, themeName: theme },
    )

    const page = await context.newPage()
    await page.goto(options.url, {
      timeout: options.timeout,
      waitUntil: 'domcontentloaded',
    })
    await waitForStablePage(page, options)

    const renderedTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    )
    if (renderedTheme !== theme) {
      throw new Error(
        `Requested the ${theme} theme, but the page rendered ${renderedTheme}`,
      )
    }

    const screenshot = await page.screenshot({
      caret: 'hide',
      type: 'png',
    })
    assertPngDimensions(screenshot, viewport.width, viewport.height)
    return screenshot
  }
  finally {
    await context.close()
  }
}

function asDataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`
}

async function composeScreenshots(browser, captures) {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    viewport: CAPTURE_LAYOUT.canvas,
  })

  try {
    const page = await context.newPage()
    await page.setContent(
      `<canvas width="${CAPTURE_LAYOUT.canvas.width}" height="${CAPTURE_LAYOUT.canvas.height}"></canvas>`,
    )

    const dataUrl = await page.evaluate(
      async ({ images, layout }) => {
        const load = source =>
          new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject(new Error('Failed to decode capture'))
            image.src = source
          })

        const [desktopDark, desktopLight, mobileDark, mobileLight]
          = await Promise.all([
            load(images.desktopDark),
            load(images.desktopLight),
            load(images.mobileDark),
            load(images.mobileLight),
          ])

        const canvas = document.querySelector('canvas')
        const context = canvas.getContext('2d')
        context.fillStyle = '#000'
        context.fillRect(0, 0, layout.canvas.width, layout.canvas.height)

        context.drawImage(desktopDark, 0, 0)
        context.save()
        context.beginPath()
        context.arc(
          layout.desktop.circle.x,
          layout.desktop.circle.y,
          layout.desktop.circle.radius,
          0,
          Math.PI * 2,
        )
        context.clip()
        context.drawImage(desktopLight, 0, 0)
        context.restore()

        context.drawImage(mobileDark, layout.mobile.x, layout.mobile.y)
        context.save()
        context.beginPath()
        context.arc(
          layout.mobile.x + layout.mobile.circle.x,
          layout.mobile.y + layout.mobile.circle.y,
          layout.mobile.circle.radius,
          0,
          Math.PI * 2,
        )
        context.clip()
        context.drawImage(mobileLight, layout.mobile.x, layout.mobile.y)
        context.restore()

        return canvas.toDataURL('image/png')
      },
      {
        images: {
          desktopDark: asDataUrl(captures.desktopDark),
          desktopLight: asDataUrl(captures.desktopLight),
          mobileDark: asDataUrl(captures.mobileDark),
          mobileLight: asDataUrl(captures.mobileLight),
        },
        layout: CAPTURE_LAYOUT,
      },
    )

    return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')
  }
  finally {
    await context.close()
  }
}

async function loadChromium() {
  try {
    const { chromium } = await import('playwright')
    return chromium
  }
  catch (error) {
    throw new Error(
      `Playwright is unavailable. Run pnpm install before capturing.\n${error.message}`,
    )
  }
}

export async function captureSiteScreenshot(options) {
  const chromium = await loadChromium()
  const browser = await chromium.launch({
    executablePath: options.browserPath,
    headless: true,
  }).catch((error) => {
    throw new Error(
      `Unable to launch Chromium. Run "pnpm exec playwright install chromium" or pass --browser-path.\n${error.message}`,
    )
  })

  let temporaryOutput
  try {
    const captures = {}
    for (const [name, theme, viewport] of [
      ['desktopDark', 'dark', CAPTURE_LAYOUT.desktop],
      ['desktopLight', 'light', CAPTURE_LAYOUT.desktop],
      ['mobileDark', 'dark', CAPTURE_LAYOUT.mobile],
      ['mobileLight', 'light', CAPTURE_LAYOUT.mobile],
    ]) {
      process.stdout.write(`Capturing ${name}... `)
      captures[name] = await captureViewport(browser, options, theme, {
        width: viewport.width,
        height: viewport.height,
      })
      process.stdout.write('done\n')
    }

    const output = await composeScreenshots(browser, captures)
    const dimensions = assertPngDimensions(
      output,
      CAPTURE_LAYOUT.canvas.width,
      CAPTURE_LAYOUT.canvas.height,
    )
    const digest = createHash('sha256').update(output).digest('hex')

    await mkdir(path.dirname(options.output), { recursive: true })
    temporaryOutput = `${options.output}.tmp-${process.pid}-${Date.now()}`
    await writeFile(temporaryOutput, output)
    await rename(temporaryOutput, options.output)
    temporaryOutput = undefined

    return {
      bytes: output.length,
      digest,
      dimensions,
      output: options.output,
      url: urlForLog(options.url),
    }
  }
  finally {
    await browser.close()
    if (temporaryOutput)
      await rm(temporaryOutput, { force: true })
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(HELP)
    return
  }

  const result = await captureSiteScreenshot(options)
  process.stdout.write(
    `${[
      `Captured ${result.url}`,
      `Wrote ${result.output}`,
      `PNG ${result.dimensions.width}x${result.dimensions.height}, ${result.bytes} bytes`,
      `SHA-256 ${result.digest}`,
    ].join('\n')}\n`,
  )
}

const isDirectRun
  = process.argv[1]
    && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
