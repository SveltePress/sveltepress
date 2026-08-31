import type { VersionManifest } from '@sveltepress/vite/versioning'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

interface VersionChangesOptions {
  manifest?: VersionManifest | null
  getManifest?: () => VersionManifest | null | undefined
  newLabel?: string
}

function collectHeadings(nodes: any[]): any[] {
  return nodes.flatMap((node) => {
    if (node.type === 'heading')
      return [node]
    if (node.type === 'liveCode')
      return []
    return Array.isArray(node.children) ? collectHeadings(node.children) : []
  })
}

function addVersionChangeId(heading: any, id: string): void {
  heading.data ??= {}
  const versionChangeIds = Array.isArray(heading.data.versionChangeIds)
    ? heading.data.versionChangeIds.filter((value: unknown): value is string => typeof value === 'string')
    : []
  heading.data.versionChangeIds = versionChangeIds.includes(id)
    ? versionChangeIds
    : [...versionChangeIds, id]
}

export default function versionChanges(options: VersionChangesOptions): Plugin {
  return () => (tree) => {
    const manifest = options.getManifest?.() ?? options.manifest
    if (!manifest)
      return

    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (node.type !== 'containerDirective' || node.name !== 'since' || index === undefined || !parent)
        return
      const [label, ...content] = node.children ?? []
      const title = label?.data?.directiveLabel
        ? label.children?.map((child: any) => child.value ?? '').join('').trim()
        : ''
      const introducedIn = node.attributes?.version
      const id = node.attributes?.id
      const sectionContent = label?.data?.directiveLabel ? content : node.children ?? []
      if (typeof id === 'string') {
        const containedHeadings = collectHeadings(sectionContent)
        if (containedHeadings.length) {
          containedHeadings.forEach(heading => addVersionChangeId(heading, id))
        }
        else {
          for (let siblingIndex = index - 1; siblingIndex >= 0; siblingIndex--) {
            const sibling = parent.children[siblingIndex]
            if (sibling.type !== 'heading')
              continue
            addVersionChangeId(sibling, id)
            break
          }
        }
      }
      const headingChildren: any[] = [
        {
          type: 'versionChangeBadge',
          data: {
            hName: 'span',
            hProperties: {
              'hidden': true,
              'ariaHidden': 'true',
              'data-sveltepress-introduced-in': introducedIn,
              'data-sveltepress-version-label-template': (options.newLabel ?? 'New in {version}')
                .replace('{version}', '__SVELTEPRESS_VERSION__'),
              'className': 'version-new-badge inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-950/45 px-2.5 py-1 text-xs font-700 text-svp-primary-deep dark:text-svp-primary',
            },
          },
          children: [],
        },
      ]
      headingChildren.push({
        type: 'versionChangeTitle',
        data: { hName: 'strong' },
        children: [{ type: 'text', value: title }],
      })
      parent.children.splice(index, 1, {
        type: 'versionChangeSection',
        data: {
          hName: 'section',
          hProperties: {
            id,
            tabIndex: -1,
            className: 'version-change-section my-6 rounded-lg b-1 b-solid b-black/8 dark:b-white/10 p-4 scroll-mt-24',
          },
        },
        children: [
          {
            type: 'versionChangeHeading',
            data: {
              hName: 'div',
              hProperties: { className: 'version-change-heading mb-2 flex flex-wrap items-center gap-2' },
            },
            children: headingChildren,
          },
          ...sectionContent,
        ],
      })
    })
  }
}
