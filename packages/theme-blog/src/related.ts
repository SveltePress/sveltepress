import type { BlogPostMeta } from './types.js'

const WEIGHT_TAG = 3
const WEIGHT_CATEGORY = 2
const WEIGHT_YEAR = 1

/**
 * Rank other posts by similarity to `current`. Scoring:
 *   +3 per shared tag, +2 same category, +1 same year.
 * Ties broken by date descending. Posts with score 0 are dropped.
 */
export function computeRelated(
  all: BlogPostMeta[],
  current: BlogPostMeta,
  limit = 3,
): BlogPostMeta[] {
  const currentTags = new Set(current.tags)
  const currentYear = current.date.slice(0, 4)
  const scored: Array<{ post: BlogPostMeta, score: number }> = []

  for (const p of all) {
    if (p.slug === current.slug)
      continue
    let score = 0
    for (const t of p.tags) {
      if (currentTags.has(t))
        score += WEIGHT_TAG
    }
    if (current.category && p.category === current.category)
      score += WEIGHT_CATEGORY
    if (p.date.slice(0, 4) === currentYear)
      score += WEIGHT_YEAR
    if (score > 0)
      scored.push({ post: p, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map(s => s.post)
}
