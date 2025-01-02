import type { Highlighter } from '@sveltepress/vite'
import type { BundledTheme, CodeToHastOptions, HighlighterGeneric, ShikiTransformer } from 'shiki'
import type { BundledLanguage } from 'shiki/langs'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { env } from 'node:process'
import { createTransformerFactory } from '@shikijs/twoslash'
import { createTwoslasher, rendererFloatingSvelte } from '@sveltepress/twoslash'
import { LRUCache } from 'lru-cache'
import { createHighlighter } from 'shiki'
import { themeOptionsRef } from '../index.js'
import { processCommands } from './commands.js'

const DEFAULT_SUPPORT_LANGUAGES: any[] = ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss']

const cache = new LRUCache<string, any>({ max: 200 })

const shikiHighlighterInstance: {
  value: null | HighlighterGeneric<BundledLanguage, BundledTheme>
  twoslashTransformer?: ShikiTransformer
} = {
  value: null,
}

const _highlighter: Highlighter = async (code, lang) => {
  const highlighterConfig = themeOptionsRef.value?.highlighter
  const darkTheme = highlighterConfig?.themeDark ?? 'night-owl'
  const lightTheme = highlighterConfig?.themeLight ?? 'vitesse-light'

  const shikiOptions: CodeToHastOptions<BundledLanguage, BundledTheme> = {
    lang,
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
    transformers: [],
  }
  if (shikiHighlighterInstance.twoslashTransformer) {
    shikiOptions.transformers?.push(
      shikiHighlighterInstance.twoslashTransformer,
    )
  }
  const { codeToHtml } = shikiHighlighterInstance.value!
  return codeToHtml(code, shikiOptions)
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/<!--svp-floating-snippet-start-->/g, '{#snippet floatingContent()}')
    .replace(/<!--svp-floating-snippet-end-->/g, '{/snippet}')
}

const highlighter: Highlighter = async (code, lang, meta) => {
  const cacheKey = JSON.stringify({ code, lang, meta })
  let cached
  if (env.NODE_ENV === 'development') {
    cached = cache.get(cacheKey)
    if (cached)
      return cached
  }
  const metaArray = (meta || '').split(' ')
  const containLineNumbers = metaArray.some(item => item.trim() === 'ln')
  const titleMeta = metaArray.find(item => item.startsWith('title='))
  const commandDoms: string[] = []
  const lines = code.split('\n')
  let noErrorsFirstLine: string | undefined
  if (lines[0] === '// @noErrors')
    noErrorsFirstLine = lines.shift()
  code = lines.map((line, i) => {
    const [commandDomsInOneLine, newLine] = processCommands(line, i, lines.length)
    commandDoms.push(...commandDomsInOneLine)
    return newLine
  }).join('\n')
  let title: string | undefined
  if (titleMeta)
    title = titleMeta.split('=')[1].replace(/(^")|("$)/g, '')
  if (noErrorsFirstLine)
    code = `${noErrorsFirstLine}\n${code}`

  cached = `
<div class="svp-code-block-wrapper">${title
  ? `<div class="svp-code-block--title">${title}</div>
`
  : ''}
  <div class="svp-code-block${containLineNumbers ? ' svp-code-block--with-line-numbers' : ''}">
    ${commandDoms.join('\n')}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    ${await _highlighter(code, lang, meta)}
    <div class="svp-code-block--lang">
      ${lang}
    </div>
    <CopyCode />
    ${containLineNumbers ? `<div class="svp-code-block--line-numbers">${lines.map((_, i) => `<div class="svp-code-block--line-number-item">${i + 1}</div>`).join('\n')}</div>` : ''}
  </div>
</div>`
  if (env.NODE_ENV === 'development')
    cache.set(cacheKey, cached)
  return cached
}

export async function initHighlighter(highlighterConfig: DefaultThemeOptions['highlighter'] = {}) {
  const langs = highlighterConfig?.languages || DEFAULT_SUPPORT_LANGUAGES
  const darkTheme = highlighterConfig?.themeDark ?? 'night-owl'
  const lightTheme = highlighterConfig?.themeLight ?? 'vitesse-light'
  shikiHighlighterInstance.value = await createHighlighter({
    langs,
    themes: [darkTheme, lightTheme],
  })
  if (highlighterConfig.twoslash) {
    shikiHighlighterInstance.twoslashTransformer = createTransformerFactory(
      await createTwoslasher(highlighterConfig.twoslash === true
        ? {
            compilerOptions: {
              module: 199,
              moduleResolution: 99,
              jsx: 1,
              types: ['@sveltepress/vite/types', '@sveltepress/theme-default/types', '@sveltepress/theme-default/components', '@sveltejs/kit'],
            },
          }
        : highlighterConfig.twoslash),
    )(
      {
        langs: ['ts', 'tsx', 'svelte'],
        renderer: rendererFloatingSvelte(),
      },
    )
  }
}

export default highlighter
