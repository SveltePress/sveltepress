import { spawn } from 'cross-spawn'
import dayjs from 'dayjs'

export function getFileLastUpdateTime(file: string) {
  return new Promise<string>((resolve) => {
    const child = spawn('git', ['log', '-1', '--format=%ci', file])
    let output = ''
    child.stdout.on('data', d => (output += String(d)))
    child.on('close', () => {
      const date = dayjs(output.trim())
      resolve(date.isValid() ? date.format('YYYY/MM/DD HH:mm:ss') : '')
    })
    child.on('error', () => resolve(''))
  })
}
