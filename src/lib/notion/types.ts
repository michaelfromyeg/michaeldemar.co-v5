// src/lib/notion/types.ts

export interface BaseNotionItem {
  id: string
  slug: string
  title: string
  createdDate: string
  editedDate: string | null
  publishedDate: string | null
  status: string
  content?: string
}

export interface BlogPost extends BaseNotionItem {
  description: string
  tags: string[]
}

export interface DesignImage {
  url: string
  caption?: string
  alt?: string
}

export interface DesignProject extends BaseNotionItem {
  description: string
  tags: string[]
  images: DesignImage[]
}

export interface TravelItinerary extends BaseNotionItem {
  description: string
  region: string
  isDone: boolean
  startDate: string
  endDate: string
  lat: number
  lon: number
  duration: number // Calculated field for convenience
}

// Type guards
export function isBlogPost(item: BaseNotionItem): item is BlogPost {
  return 'tags' in item
}

export function isDesignProject(item: BaseNotionItem): item is DesignProject {
  return 'images' in item
}

export function isTravelItinerary(
  item: BaseNotionItem
): item is TravelItinerary {
  return 'region' in item && 'isDone' in item
}
