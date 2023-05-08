import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export const pkgRe = /^@install-pkg\((\S+)(,\S+)?\)/

type PackageManager = 'npm' | 'yarn' | 'pnpm'

const installPkg: Plugin<any[], any> = () => {
  return async tree => {
    visit(tree, (node, idx, parent) => {
      if (node.type === 'paragraph' && node.children) {
        const [textNode] = node.children
        if (textNode && textNode.type === 'text') {
          const matches = pkgRe.exec(textNode.value)
          if (matches) {
            const [, pkgNameMaybeWithCustomScript] = matches
            if (pkgNameMaybeWithCustomScript) {
              const [pkgName, customScript] = pkgNameMaybeWithCustomScript.split(',')
              const wrapWithSlot = (slotName: PackageManager, installScript: string) => {
                return {
                  type: 'InstallPkg',
                  data: {
                    hName: 'div',
                    hProperties: {
                      slot: slotName,
                    },
                  },
                  children: [{
                    type: 'code',
                    lang: 'sh',
                    value: `${slotName} ${customScript || installScript} ${pkgName}`,
                  }],
                }
              }
              const npmNode = wrapWithSlot('npm', 'install --save')
              const yarnNode = wrapWithSlot('yarn', 'add')
              const pnpmNode = wrapWithSlot('pnpm', 'install')
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
          }
        }
      }
    })
  }
}

export default installPkg
