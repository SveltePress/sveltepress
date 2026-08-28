export const gotoCalls: string[] = []

export async function goto(href: string) {
  gotoCalls.push(href)
}

export function afterNavigate(callback: () => void) {
  callback()
}

export function beforeNavigate() {}

export function onNavigate() {}

export function resetNavigation() {
  gotoCalls.length = 0
}
