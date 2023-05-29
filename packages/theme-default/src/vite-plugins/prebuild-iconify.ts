import { readFile } from 'node:fs/promises'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import type { PluginOption } from 'vite'
import { getIconsCSS } from '@iconify/utils'
import { locate } from '@iconify/json'

const ALL_ICONS_MODULE = 'virtual:sveltepress/feature-icons.css'

const iconifyIcons: (themeOptions?: DefaultThemeOptions) => PluginOption = themeOptions => ({
  name: '@sveltepress/theme-default/iconify-feature-icons',
  resolveId(id) {
    if (id === ALL_ICONS_MODULE) return ALL_ICONS_MODULE
  },
  async load(id) {
    if (id === ALL_ICONS_MODULE) {
      const icons = themeOptions?.preBuildIconifyIcons
      if (!icons) return ''
      let code = ''
      for (const prefix in icons) {
        const filename = locate(prefix)
        const iconSet = JSON.parse(await readFile(filename, 'utf8'))
        const css = getIconsCSS(iconSet, icons[prefix])
        code += css
      }
      return code
    }
  },
})

export default iconifyIcons
