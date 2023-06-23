/* eslint-disable no-console */
import pc from 'picocolors'

const SVELTEPRESS_INFO_PREFIX = '[Sveltepress]'

export function info(...messages: any[]) {
  console.log(pc.bold(pc.white(pc.bgCyan(SVELTEPRESS_INFO_PREFIX))), ...messages)
}
