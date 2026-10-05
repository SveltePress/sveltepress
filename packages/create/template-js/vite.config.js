import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
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
				github: 'https://github.com/SveltePress/sveltepress',
				logo: '/sveltepress.svg',
			}),
			siteConfig: {
				title: 'Sveltepress',
				description: 'A content centered site build tool',
			},
			// SvelteKit config (SvelteKit 3 no longer reads svelte.config.js).
			// Sveltepress adds the '.md' extension for you.
			svelteKitOptions: {
				preprocess: [vitePreprocess()],
				adapter: adapter({
					pages: 'dist',
				}),
			},
		}),
	],
})

export default config
