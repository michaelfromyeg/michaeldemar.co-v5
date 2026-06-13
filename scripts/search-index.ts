import type {
  BlogPost,
  DesignProject,
  TravelItinerary,
} from '../src/lib/notion/types'

const EXCERPT_LENGTH = 1000

// Strips markdown syntax and truncates so the search index ships a slim
// plain-text excerpt instead of each item's full content.
function markdownToExcerpt(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, EXCERPT_LENGTH)
}

// Builds the documents for src/data/search-index.json, consumed at runtime
// by src/lib/search.ts (which defines the matching SearchDocument type).
export function buildSearchIndex(
  posts: BlogPost[],
  projects: DesignProject[],
  itineraries: TravelItinerary[]
) {
  return [
    ...posts.map((post) => ({
      id: post.id,
      title: post.title,
      href: `/blog/${post.slug}`,
      type: 'blog' as const,
      description: post.description,
      date: post.publishedDate || post.createdDate,
      tags: post.tags,
      content: markdownToExcerpt(post.content ?? ''),
    })),
    ...projects.map((project) => ({
      id: project.id,
      title: project.title,
      href: `/design/${project.slug}`,
      type: 'design' as const,
      description: project.description,
      date: project.publishedDate || project.createdDate,
      tags: project.tags,
      content: markdownToExcerpt(project.content ?? ''),
    })),
    ...itineraries.map((itinerary) => ({
      id: itinerary.id,
      title: itinerary.title,
      href: `/travel/${itinerary.slug}`,
      type: 'travel' as const,
      description: itinerary.description,
      date: itinerary.startDate,
      content: [
        itinerary.waypoints.map((waypoint) => waypoint.title).join(' '),
        markdownToExcerpt(itinerary.content ?? ''),
      ]
        .join(' ')
        .trim(),
    })),
  ]
}
