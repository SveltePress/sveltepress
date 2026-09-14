const state = $state({
  error: null as Error | null,
  route: { id: '/playground/' as string | null },
  url: new URL('https://sveltepress.test/playground/'),
})

export const page = state

export function setPage(pathname: string) {
  state.route.id = pathname
  state.url = new URL(pathname, 'https://sveltepress.test')
}
