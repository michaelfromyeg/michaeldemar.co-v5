// src/lib/notion/types.ts

// The subset of Notion page-property shapes this site reads. Notion's own
// PageObjectResponse['properties'] is a per-key discriminated union that can't
// be narrowed by field without runtime checks, so we describe the shapes we
// actually access. Cast a page's properties to this with `as unknown as`.
export interface NotionPageProperties {
  [key: string]: {
    title?: Array<{ plain_text: string }>
    rich_text?: Array<{ plain_text: string }>
    formula?: { string?: string }
    status?: { name: string }
    select?: { name: string }
    multi_select?: Array<{ name: string }>
    date?: { start: string }
    number?: number
    checkbox?: boolean
    relation?: Array<{ id: string }>
    created_time?: string
    last_edited_time?: string
  }
}

export interface BaseNotionItem {
  id: string
  slug: string
  title: string
  createdDate: string
  editedDate: string | null
  publishedDate: string | null
  status: string
  content?: string
  coverImage: string | null
  blurDataURL: string | null
}

export interface BlogPost extends BaseNotionItem {
  description: string
  tags: string[]
}

export interface DesignImage {
  url: string
  caption?: string
  alt?: string
  blurDataURL: string | null
}

export interface DesignProject extends BaseNotionItem {
  description: string
  tags: string[]
  images: DesignImage[]
}

export interface Waypoint {
  id: string
  title: string
  notes: string
  latitude: number
  longitude: number
  date: string
  duration: number
  itineraryId: string
}

export interface TravelItinerary extends BaseNotionItem {
  description: string
  region: string
  startDate: string
  endDate: string
  waypoints: Waypoint[]
  // Removing isDone as it's now determined by dates
  // Removing lat/lon as they're now part of waypoints
}

// Type guards
export function isBlogPost(item: BaseNotionItem): item is BlogPost {
  return 'tags' in item
}

export function isDesignProject(item: BaseNotionItem): item is DesignProject {
  return 'images' in item
}

// Type guards
export function isWaypoint(item: object): item is Waypoint {
  return (
    'latitude' in item &&
    'longitude' in item &&
    'itineraryId' in item &&
    'duration' in item
  )
}

export function isTravelItinerary(
  item: BaseNotionItem
): item is TravelItinerary {
  return 'region' in item && 'waypoints' in item
}
