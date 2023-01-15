// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}
declare module '*.md' {
	import { SvelteComponentTyped } from "svelte"

	const metadata: Record<string, any>
	const comp: SvelteComponentTyped

	export { metadata }

	export default comp
}