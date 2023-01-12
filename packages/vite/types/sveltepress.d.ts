declare module "sveltepress:pages" {
  const pages: Array<{
    fm: Record<string, any>
    to: string
  }>

  export default pages
}

declare module "sveltepress:site" {
  const siteConfig: {
    title: string
    description: string
  }

  export default siteConfig
}