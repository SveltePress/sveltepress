import type { Entry } from './_catalog'
import { writable } from 'svelte/store'

export const VARIANTS = [
  { key: 'A', name: 'Index strip' },
  { key: 'B', name: 'Directory rail' },
  { key: 'C', name: 'Stage dock' },
] as const

export type VariantKey = (typeof VARIANTS)[number]['key']
export type BootState = 'loading' | 'ready' | 'failed'

export interface VariantProps {
  entry: Entry | null
  boot: BootState
}

export interface EditorStubProps {
  entry: Entry
  boot: BootState
}

export const prototypeBoot = writable<BootState>('loading')
export const prototypeView = writable<'home' | 'entry'>('home')

export function currentVariant(url: URL): VariantKey {
  const value = url.searchParams.get('variant')
  if (value === 'B' || value === 'C')
    return value
  return 'A'
}

export function playgroundHref(slug: string | null, url: URL): string {
  const path = slug
    ? `/prototype/playground/${slug}/`
    : '/prototype/playground/'
  const params = new URLSearchParams()
  const variant = url.searchParams.get('variant')
  const boot = url.searchParams.get('boot')
  if (variant)
    params.set('variant', variant)
  if (boot)
    params.set('boot', boot)
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function variantHref(key: VariantKey, url: URL): string {
  const params = new URLSearchParams(url.searchParams)
  if (key === 'A')
    params.delete('variant')
  else
    params.set('variant', key)
  const query = params.toString()
  return query ? `${url.pathname}?${query}` : url.pathname
}
