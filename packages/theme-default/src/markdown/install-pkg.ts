import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import highlighter from './highlighter.js'

// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation, regexp/no-misleading-capturing-group
export const pkgRe = /^@install-pkg\((\S+)(,\S+)?\)/

type PackageManager = 'npm' | 'yarn' | 'pnpm'

const installPkg: Plugin<any[], any> = () => {
  return async (tree) => {
    const tasks: any[] = []
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        const [textNode] = node.children
        if (textNode && textNode.type === 'text') {
          const matches = pkgRe.exec(textNode.value)
          if (matches) {
            const [, pkgNameMaybeWithCustomScript] = matches
            if (pkgNameMaybeWithCustomScript) {
              const [pkgName, customScript] = pkgNameMaybeWithCustomScript.split(',')
              const wrapWithSnippet = async (snippetName: PackageManager, installScript: string) => {
                const code = `${snippetName} ${customScript || installScript} ${pkgName}`
                return {
                  type: 'html',
                  value: `{#snippet ${snippetName}()}${await highlighter(code, 'sh')}{/snippet}`,
                }
              }
              const asyncTask = async () => {
                const npmNode = await wrapWithSnippet('npm', 'install --save')
                const yarnNode = await wrapWithSnippet('yarn', 'add')
                const pnpmNode = await wrapWithSnippet('pnpm', 'install')
                parent.children.splice(idx, 1, {
                  type: 'InstallPkg',
                  data: {
                    hName: 'InstallPkg',
                  },
                  children: [
                    npmNode,
                    yarnNode,
                    pnpmNode,
                  ],
                })
              }
              tasks.push(asyncTask())
            }
          }
        }
      }
    })
    await Promise.all(tasks)
  }
}

export default installPkg
