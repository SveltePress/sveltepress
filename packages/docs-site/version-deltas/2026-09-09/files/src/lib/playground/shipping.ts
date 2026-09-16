import type { Entry } from './catalog.ts'
import { GROUPS, shippingEntries } from './catalog.ts'

export function shippingGroups(): string[] {
  const shipping = shippingEntries()
  return GROUPS.filter(group => shipping.some(entry => entry.group === group))
}

export function shippingEntriesInGroup(group: string): Entry[] {
  return shippingEntries().filter(entry => entry.group === group)
}
