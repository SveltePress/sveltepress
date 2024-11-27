declare module 'virtual:sveltepress/site' {
  const siteConfig: {
    title: string
    description: string
  }

  export default siteConfig
}

declare module '*.md' {
  import type { SvelteComponentTyped } from 'svelte'

  const comp: SvelteComponentTyped
  export default comp
}
