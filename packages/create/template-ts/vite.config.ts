import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
	plugins: [
		sveltepress({
			theme: defaultTheme({
				navbar: [
					// Add your navbar configs here
				],
				sidebar: {
					// Add your sidebar configs here
				},
				github: 'https://github.com/Blackman99/sveltepress',
				logo: '/sveltepress.svg',
			}),
			siteConfig: {
				title: 'Sveltepress',
				description: 'A content centered site build tool',
			},
		}),
	],
})

export default config
