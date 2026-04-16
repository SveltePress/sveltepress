import process from 'node:process'
import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'Example Blog',
        description: 'A demo blog powered by @sveltepress/theme-blog',
        base: process.env.SITE_URL ?? 'http://localhost:4173',
        author: {
          name: 'Demo Author',
          avatar: '/avatar.png',
          bio: 'Writes about Svelte, CSS, and keeping the web fast.',
          socials: {
            github: 'sveltepress',
            twitter: 'sveltejs',
            email: 'demo@example.com',
            rss: '/rss.xml',
          },
        },
        about: {
          html: '<p>Short note: the demo content is rendered by <code>@sveltepress/theme-blog</code>.</p>',
        },
        navbar: [
          { title: 'Home', to: '/' },
          { title: 'Timeline', to: '/timeline/' },
          { title: 'Tags', to: '/tags/' },
        ],
        rss: {
          enabled: true,
          limit: 20,
          copyright: `© ${new Date().getFullYear()} Example Blog`,
        },
        // Uncomment and fill with real values from https://giscus.app to enable comments.
        // giscus: {
        //   repo: 'you/your-repo',
        //   repoId: 'R_xxxxxxxx',
        //   category: 'Announcements',
        //   categoryId: 'DIC_xxxxxxxx',
        //   mapping: 'pathname',
        // },
      }),
      siteConfig: {
        title: 'Example Blog',
        description: 'A demo blog powered by @sveltepress/theme-blog',
      },
    }),
  ],
  server: {
    port: 36739,
  },
})

export default config
