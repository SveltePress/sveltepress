import type { Writable } from 'svelte/store'

const SVELTEPRESS_CONTEXT_KEY = Symbol('sveltepress')
const TITLE_ROW_ACTION_KEY = Symbol('sveltepress-title-row-action')

export interface SveltepressContext {
  isDark: Writable<boolean>
}

/** Href and label for the optional PageLayout title-row action. */
export interface TitleRowAction {
  href: string
  label: string
}

/** Per-request title-row action. Use a getter so SPA navigations stay in sync. */
export interface TitleRowActionContext {
  readonly current: TitleRowAction | undefined
}

export {
  SVELTEPRESS_CONTEXT_KEY,
  TITLE_ROW_ACTION_KEY,
}
