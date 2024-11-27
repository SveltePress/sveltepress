import type { Placement } from '@floating-ui/dom'
import type { Snippet } from 'svelte'

export interface PropType {
  children?: any
  show?: boolean
  alwaysShow?: boolean
  placement?: Placement
  floatingClass?: string
  content?: Snippet
  floatingContent?: Snippet
}
