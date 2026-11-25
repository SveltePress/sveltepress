import type { BundledTheme } from 'shiki'

export interface ShikiThemeConfig {
  themeLight?: BundledTheme
  themeDark?: BundledTheme
}

export const DEFAULT_THEME_LIGHT: BundledTheme = 'vitesse-light'
export const DEFAULT_THEME_DARK: BundledTheme = 'night-owl'

/**
 * Resolve the shiki light and dark themes from the `highlighter` theme option.
 *
 * `highlighter` is optional in `DefaultThemeOptions`, and the options reach
 * the browser exactly as the user wrote them, so callers may pass `undefined`.
 */
export function resolveShikiThemes(highlighter?: ShikiThemeConfig) {
  return {
    light: highlighter?.themeLight ?? DEFAULT_THEME_LIGHT,
    dark: highlighter?.themeDark ?? DEFAULT_THEME_DARK,
  }
}
