import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { collectSectionTabIconClasses } from '../components/section-tabs.js'

/** UnoCSS icon classes to generate even though no scanned source names them. */
export function getIconSafelist(themeOptions?: DefaultThemeOptions): string[] {
  const icons = themeOptions?.preBuildIconifyIcons ?? {}
  const iconSafelist: string[] = []
  for (const prefix in icons) {
    icons[prefix].forEach((name) => {
      iconSafelist.push(`i-${prefix}-${name}`)
    })
  }
  // Tab icons come from config, never from scanned source, so build them too.
  for (const iconClass of collectSectionTabIconClasses(themeOptions?.sectionTabs)) {
    if (!iconSafelist.includes(iconClass))
      iconSafelist.push(iconClass)
  }
  return iconSafelist
}
