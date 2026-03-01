export interface MeilisearchProps {
  /** Meilisearch host URL */
  host: string
  /** Meilisearch API key (use search-only key) */
  apiKey: string
  /** Index name to search */
  indexName: string
  /** Placeholder text for search input */
  placeholder?: string
  /** Maximum number of results */
  limit?: number
}

export interface SearchResult {
  id: string
  title: string
  content: string
  url: string
}
