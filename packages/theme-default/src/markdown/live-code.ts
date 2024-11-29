import type { Plugin } from 'unified'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { mdToSvelte } from '@sveltepress/vite'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { uid } from 'uid'
import { visit } from 'unist-util-visit'
import { highlighter, themeOptionsRef } from '../index.js'
import admonitions from './admonitions.js'
import anchors from './anchors.js'
import codeImport from './code-import.js'
import installPkg from './install-pkg.js'
import links from './links.js'

const BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')
const LIVE_CODE_MAP = resolve(BASE_PATH, 'live-code-map.json')

const SUPPORTED_LIVE_LANGS = ['svelte', 'md'] as const
type SupportedLiveLang = typeof SUPPORTED_LIVE_LANGS[number]

interface LiveCodePathItem {
  componentName: string
  path: string
}

const globalComponentsImporters = [
  'import { Expansion, Link, CopyCode, Tabs, TabPanel, InstallPkg, IconifyIcon } from \'@sveltepress/theme-default/components\'',
]

const twoslashImporter = ['import Floating from \'@sveltepress/twoslash/FloatingWrapper.svelte\'']

function createAsyncImportCode(componentPath: string) {
  return `
{#await import('${componentPath}')}
  <div class="svp--async-live-code--loading">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <defs><filter id="svgSpinnersGooeyBalls20"><feGaussianBlur in="SourceGraphic" result="y" stdDeviation="1"/><feColorMatrix in="y" result="z" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#svgSpinnersGooeyBalls20)"><circle cx="5" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="5;8;5"/></circle><circle cx="19" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="19;16;19"/></circle><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></g>
    </svg>
  </div>
{:then { default: ImportedComponent }}
  <ImportedComponent />
{:catch err}
  <div class="svp--async-live-code--error">
    {err}
  </div>
{/await}
`
}

const liveCode: Plugin<any[], any> = function () {
  if (!existsSync(BASE_PATH)) {
    mkdirSync(BASE_PATH, {
      recursive: true,
    })
  }

  if (!existsSync(LIVE_CODE_MAP))
    writeFileSync(LIVE_CODE_MAP, '{}')

  return async (tree, vFile) => {
    let hasScript = false
    const liveCodePaths: LiveCodePathItem[] = []
    const asyncNodeOperations: Promise<any>[] = []
    visit(
      tree,
      (node, idx, parent) => {
        const { meta, lang, type, data } = node
        const metaArray = meta?.split(' ') || []
        const isAsync = metaArray.includes('async')
        if (type === 'code'
          && SUPPORTED_LIVE_LANGS.includes(lang)
          && metaArray.includes('live')
          && idx !== null
        ) {
          const getLiveNodeFromLang = async (lang: SupportedLiveLang) => {
            if (lang === 'svelte') {
              const idNameMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'))

              const blockId = `${vFile.path}-${idx}`

              let name = idNameMap[blockId]
              if (!name) {
                const svelteFileName = `LiveCode${uid()}`
                name = idNameMap[blockId] = `${svelteFileName}.svelte`
                writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap, null, 2))
              }

              const path = resolve(BASE_PATH, name)
              writeFileSync(path, node.value || '')

              const componentName = name.replace(/\.svelte$/, '')
              const componentPath = `/.sveltepress/live-code/${name}`
              if (!isAsync) {
                liveCodePaths.push({
                  componentName,
                  path: componentPath,
                })
              }
              const svelteComponent = {
                type: 'html',
                value: `
<div class="svp-live-code--demo">
  ${isAsync ? createAsyncImportCode(componentPath) : `<${componentName} />`}
</div>
`,
              }
              return [svelteComponent]
            }
            else if (lang === 'md') {
              const noAst = meta.split(' ').includes('no-ast')
              return [
                {
                  type: 'html',
                  value: '<div class="p-4">',
                },
                ...(noAst
                  ? [
                      {
                        type: 'html',
                        value: (await mdToSvelte({
                          mdContent: node.value,
                          filename: 'live-code.md',
                          remarkPlugins: [
                            admonitions,
                            links,
                            anchors,
                            codeImport,
                            installPkg,
                          ],
                          highlighter,
                        })).code,
                      },
                    ]
                  : fromMarkdown(`\n${node.value}\n`, { mdastExtensions: [gfmFromMarkdown()] }).children),
                {
                  type: 'html',
                  value: '</div>',
                },
              ]
            }
          }
          const asyncAdd = async () => {
            const codeHighlightNode = {
              type: 'code',
              lang,
              value: node.value,
              data,
              meta,
            }
            const liveCodeNode = {
              type: 'liveCode',
              data: {
                hName: 'div',
                hProperties: {
                  className: 'svp-live-code--container',
                },
              },
              children: [
                {
                  type: 'html',
                  value: '<div></div>',
                },
                ...await getLiveNodeFromLang(lang) as any[],
                {
                  type: 'html',
                  value: `<Expansion codeType="${lang}" title="${themeOptionsRef.value?.i18n?.expansionTitle || 'Click fold/expand code'}" reverse={true}>`,
                },
                codeHighlightNode,
                {
                  type: 'html',
                  value: '</Expansion>',
                },
              ],
            }

            parent.children.splice(idx, 1, liveCodeNode)
          }

          asyncNodeOperations.push(asyncAdd())
        }
      },
    )

    await Promise.allSettled(asyncNodeOperations)

    const liveCodeImports = liveCodePaths.map(({ componentName, path }) => `import ${componentName} from '${path}'`)

    visit(tree, (node, idx, parent) => {
      if (node.type === 'html' && node.value.startsWith('<script') && !hasScript) {
        hasScript = true
        const value = node.value.replace(/^<script[ \w+="]*>/, (m: string) =>
          [m, ...globalComponentsImporters, ...(themeOptionsRef.value?.highlighter?.twoslash ? [twoslashImporter] : []), ...liveCodeImports].join('\n'))
        parent.children.splice(idx, 1, {
          type: 'html',
          value,
        })
      }
    })

    if (!hasScript) {
      tree.children.unshift({
        type: 'html',
        value: ['<script>', ...globalComponentsImporters, ...(themeOptionsRef.value?.highlighter?.twoslash ? [twoslashImporter] : []), ...liveCodeImports, '</script>'].join('\n'),
      })
    }
  }
}

export default liveCode
