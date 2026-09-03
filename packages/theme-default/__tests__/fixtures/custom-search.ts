// Test stand-in for `virtual:sveltepress/theme-default/custom-search`: the
// loader returns the CustomSearchProbe component, mirroring what the theme
// plugin generates for a configured string `search` path.
import CustomSearchProbe from './CustomSearchProbe.svelte'

export async function loadCustomSearch() {
  return { default: CustomSearchProbe }
}
