import { readFile } from 'node:fs/promises'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import type { PluginOption } from 'vite'
import { getIconsCSS } from '@iconify/utils'
import { locate } from '@iconify/json'

const ALL_ICONS_MODULE = 'virtual:sveltepress/prebuild-iconify-icons.css'
const ALL_ICONS_INLINE = 'sveltepress/prebuild-iconify-icons.css?inline='

const iconifyIcons: (themeOptions?: DefaultThemeOptions) => PluginOption = themeOptions => ({
  name: '@sveltepress/theme-default/iconify-feature-icons',
  resolveId(id) {
    if (id === ALL_ICONS_MODULE)
      return ALL_ICONS_MODULE
    if (id === ALL_ICONS_INLINE)
      return ALL_ICONS_INLINE
  },
  async load(id) {
    if (id === ALL_ICONS_MODULE) {
      const icons = themeOptions?.preBuildIconifyIcons
      if (!icons)
        return ''
      let code = ''
      for (const prefix in icons) {
        const filename = locate(prefix)
        const iconSet = JSON.parse(await readFile(filename, 'utf8'))
        const css = getIconsCSS(iconSet, icons[prefix])
        code += css
      }
      return code
    }
    if (id === ALL_ICONS_INLINE)
      return ''
  },
})

export default iconifyIcons
