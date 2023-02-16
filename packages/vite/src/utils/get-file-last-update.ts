import { spawn } from 'cross-spawn'
import dayjs from 'dayjs'

export function getFileLastUpdateTime(file: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn('git', ['log', '-1', '--pretty="%ci"', file])
    let output = ''
    child.stdout.on('data', d => (output += String(d)))
    child.on('close', () => {
      const date = new Date(output)
      resolve(
        dayjs(date).format('YYYY/MM/DD HH:mm:ss'),
      )
    })
    child.on('error', reject)
  })
}
