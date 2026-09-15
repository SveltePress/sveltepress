import type { Handle } from '@sveltejs/kit'

export const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
} as const

export function applyIsolationHeaders(headers: Headers): void {
  for (const [name, value] of Object.entries(isolationHeaders))
    headers.set(name, value)
}

export const isolationHandle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event)
  applyIsolationHeaders(response.headers)
  return response
}
