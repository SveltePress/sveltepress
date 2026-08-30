import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const GLOBAL_COMPONENTS = [
  'Expansion',
  'Link',
  'CopyCode',
  'Tabs',
  'TabPanel',
  'InstallPkg',
  'IconifyIcon',
  'CodeBlock',
] as const

const componentImports: Plugin<any[], any> = function () {
  return (tree) => {
    const generatedSource = JSON.stringify(tree)
    const usedComponents = GLOBAL_COMPONENTS.filter(component =>
      new RegExp(`(?:<${component}(?:[\\s/>])|"tagName":"${component}")`).test(generatedSource),
    )
    const importers = [
      ...(usedComponents.length
        ? [`import { ${usedComponents.join(', ')} } from '@sveltepress/theme-default/components'`]
        : []),
      ...(generatedSource.includes('<Floating')
        ? ['import Floating from \'@sveltepress/twoslash/FloatingWrapper.svelte\'']
        : []),
    ]
    if (!importers.length)
      return
    let injected = false
    visit(tree, (node, index, parent) => {
      if (injected || index === undefined || !parent || !['html', 'raw'].includes(node.type) || !node.value.startsWith('<script'))
        return
      injected = true
      parent.children.splice(index, 1, {
        type: node.type,
        value: node.value.replace(/^<script[ \w+="]*>/, (tag: string) => [tag, ...importers].join('\n')),
      })
    })
    if (!injected) {
      tree.children.unshift({
        type: 'raw',
        value: ['<script>', ...importers, '</script>'].join('\n'),
      })
    }
  }
}

export default componentImports
