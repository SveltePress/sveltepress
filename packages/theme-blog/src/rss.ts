import type { BlogPost } from './types.js'

export interface RssOptions {
  title: string
  base: string
  description?: string
  copyright?: string
  limit?: number
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generateRss(posts: BlogPost[], opts: RssOptions): string {
  const limit = opts.limit ?? 20
  const limited = posts.slice(0, limit)
  const base = opts.base.replace(/\/$/, '')

  const items = limited.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/posts/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${base}</link>
    <description>${escapeXml(opts.description ?? '')}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${opts.copyright ? `<copyright>${escapeXml(opts.copyright)}</copyright>` : ''}
    ${items}
  </channel>
</rss>`
}
