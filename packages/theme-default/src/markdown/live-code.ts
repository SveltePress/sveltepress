import type { Plugin } from 'unified'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { mdToSvelte } from '@sveltepress/vite'
import { emitPageArtifactFile } from '@sveltepress/vite/versioning'
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
  return async (tree, vFile) => {
    let hasScript = false
    const asyncNodeOperations: Array<Promise<LiveCodePathItem | null>> = []
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
              const content = node.value || ''
              const digest = createHash('sha256').update(content).digest('hex')
              const generatedName = `${digest}.svelte`
              const generatedPath = emitPageArtifactFile(vFile, {
                path: `live-code/${generatedName}`,
                content,
              })
              let componentName: string
              let componentPath: string
              if (generatedPath) {
                componentName = `LiveCode${digest}`
                componentPath = generatedPath
              }
              else {
                if (!existsSync(BASE_PATH))
                  mkdirSync(BASE_PATH, { recursive: true })
                if (!existsSync(LIVE_CODE_MAP))
                  writeFileSync(LIVE_CODE_MAP, '{}')
                const idNameMap = JSON.parse(readFileSync(LIVE_CODE_MAP, 'utf-8'))
                const blockId = `${vFile.path}-${idx}`
                let name = idNameMap[blockId]
                if (!name) {
                  const svelteFileName = `LiveCode${uid()}`
                  name = idNameMap[blockId] = `${svelteFileName}.svelte`
                  writeFileSync(LIVE_CODE_MAP, JSON.stringify(idNameMap, null, 2))
                }
                writeFileSync(resolve(BASE_PATH, name), content)
                componentName = name.replace(/\.svelte$/, '')
                componentPath = `/.sveltepress/live-code/${name}`
              }
              const importItem = !isAsync
                ? {
                    componentName,
                    path: componentPath,
                  }
                : null
              const svelteComponent = {
                type: 'html',
                value: `
<div class="svp-live-code--demo">
  ${isAsync ? createAsyncImportCode(componentPath) : `<${componentName} />`}
</div>
`,
              }
              return { nodes: [svelteComponent], importItem }
            }
            else if (lang === 'md') {
              const noAst = meta.split(' ').includes('no-ast')
              return { nodes: [
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
              ], importItem: null }
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
            const result = await getLiveNodeFromLang(lang)
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
                ...result.nodes as any[],
                {
                  type: 'html',
                  value: `<Expansion codeType="${lang}" title="${themeOptionsRef.value?.i18n?.expansionTitle || 'View code'}" reverse={true}>`,
                },
                codeHighlightNode,
                {
                  type: 'html',
                  value: '</Expansion>',
                },
              ],
            }

            parent.children.splice(idx, 1, liveCodeNode)
            return result.importItem
          }

          asyncNodeOperations.push(asyncAdd())
        }
      },
    )

    const liveCodePaths = new Map<string, LiveCodePathItem>()
    for (const item of await Promise.all(asyncNodeOperations)) {
      if (item)
        liveCodePaths.set(item.componentName, item)
    }

    const liveCodeImports = Array.from(liveCodePaths.values()).map(({ componentName, path }) => `import ${componentName} from '${path}'`)
    const importers = liveCodeImports

    visit(tree, (node, idx, parent) => {
      if (importers.length && node.type === 'html' && node.value.startsWith('<script') && !hasScript) {
        hasScript = true
        const value = node.value.replace(/^<script[ \w+="]*>/, (m: string) =>
          [m, ...importers].join('\n'))
        parent.children.splice(idx, 1, {
          type: 'html',
          value,
        })
      }
    })

    if (importers.length && !hasScript) {
      tree.children.unshift({
        type: 'html',
        value: ['<script>', ...importers, '</script>'].join('\n'),
      })
    }
  }
}

export default liveCode
