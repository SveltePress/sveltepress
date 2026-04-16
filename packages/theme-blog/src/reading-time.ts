/** Strip markdown tokens (headings, bold, code, links) before counting words. */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1') // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // inline code / fenced code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .trim()
}

/**
 * Estimate reading time in minutes.
 * Assumes 200 words per minute; always returns at least 1.
 */
export function readingTime(text: string): number {
  const clean = stripMarkdown(text)
  const words = clean.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
