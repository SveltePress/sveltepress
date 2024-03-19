import type { Writable } from 'svelte/store'

const SVELTEPRESS_CONTEXT_KEY = Symbol('sveltepress')

export interface SveltepressContext {
  isDark: Writable<boolean>
}

export {
  SVELTEPRESS_CONTEXT_KEY,
}
