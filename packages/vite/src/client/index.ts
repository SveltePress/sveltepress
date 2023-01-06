import pages from 'sveltepress:pages'

export const getSidebars = (routeId: string) => pages.filter(page => page.startsWith(routeId))
