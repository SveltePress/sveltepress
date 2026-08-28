import process from 'node:process'
import { runCli } from './index.js'

process.exitCode = await runCli(process.argv.slice(2))
