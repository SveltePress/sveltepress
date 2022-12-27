// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces


// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

declare module '*.svx' {

	const metadata: Record<string, any>
	const comp: any

	export { metadata }

	export default comp
}

declare module '*.md' {

	const metadata: Record<string, any>
	const comp: any

	export { metadata }

	export default comp
}

declare module 'remark-admonitions' {
	import type { Plugin } from 'unified'
	const plugin: Plugin

	export default plugin
}