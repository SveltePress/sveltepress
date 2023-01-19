/// <reference types="@svelte-press/theme-default/types" />
/// <reference types="@svelte-press/vite/types" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

/// <reference path="../node_modules/@svelte-press/theme-default/types.d.ts" />
declare module '*.md' {
	import { SvelteComponentTyped } from "svelte"

	const metadata: Record<string, any>
	const comp: SvelteComponentTyped

	export { metadata }

	export default comp
}
