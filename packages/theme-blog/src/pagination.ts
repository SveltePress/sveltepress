export function paginationWindow(current: number, total: number): Array<number | '…'> {
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1)

  // Start with a centered window of 5
  let windowStart = current - 2
  let windowEnd = current + 2

  // Clamp to valid inner range [2, total-1]
  if (windowStart < 2) {
    windowStart = 2
    windowEnd = Math.min(total - 1, 5) // always show at least pages 2-5
  }
  if (windowEnd > total - 1) {
    windowEnd = total - 1
    windowStart = Math.max(2, total - 4) // always show at least pages (total-4)..(total-1)
  }

  const result: Array<number | '…'> = [1]
  if (windowStart === 3)
    result.push(2)
  else if (windowStart > 3)
    result.push('…')
  for (let i = windowStart; i <= windowEnd; i++) result.push(i)
  if (windowEnd === total - 2)
    result.push(total - 1)
  else if (windowEnd < total - 2)
    result.push('…')
  result.push(total)
  return result
}
