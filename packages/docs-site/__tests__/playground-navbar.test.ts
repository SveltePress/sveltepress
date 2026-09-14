import { describe, expect, it } from 'vitest'
import bnNavbar from '../config/bn/navbar.ts'
import enNavbar from '../config/navbar.ts'
import zhNavbar from '../config/zh/navbar.ts'

const BLOG_DEMO_HREF = 'https://sveltepress.github.io/sveltepress/blog-demo/'

function playgroundItem(navbar: typeof enNavbar) {
  return navbar.find(item => item.to === '/playground/')
}

function blogDemoItem(navbar: typeof enNavbar) {
  return navbar.find(item => item.external && item.to === BLOG_DEMO_HREF)
}

describe('navbar Playground', () => {
  it('lands each locale on that locale\'s Playground home', () => {
    expect(playgroundItem(enNavbar)).toMatchObject({
      title: 'Playground',
      to: '/playground/',
    })
    expect(playgroundItem(zhNavbar)).toMatchObject({
      title: '演练场',
      to: '/playground/',
    })
    expect(playgroundItem(bnNavbar)).toMatchObject({
      title: 'প্লেগ্রাউন্ড',
      to: '/playground/',
    })
    expect(playgroundItem(enNavbar)?.external).toBeFalsy()
    expect(playgroundItem(zhNavbar)?.external).toBeFalsy()
    expect(playgroundItem(bnNavbar)?.external).toBeFalsy()
  })

  it('keeps Blog demo as a distinct external navbar item', () => {
    for (const navbar of [enNavbar, zhNavbar, bnNavbar]) {
      const playground = playgroundItem(navbar)
      const blogDemo = blogDemoItem(navbar)
      expect(playground).toBeDefined()
      expect(blogDemo).toBeDefined()
      expect(blogDemo?.to).not.toBe(playground?.to)
      expect(blogDemo?.external).toBe(true)
    }
  })

  it('does not add Kitchen sink to the site Navbar', () => {
    for (const navbar of [enNavbar, zhNavbar, bnNavbar]) {
      expect(navbar.some(item => item.to === '/playground/kitchen-sink/')).toBe(false)
      expect(JSON.stringify(navbar)).not.toMatch(/kitchen-sink/i)
    }
  })
})
