import MiniSearch from 'minisearch'
import blogData from '@/data/blog.json'
import designData from '@/data/design.json'
import travelData from '@/data/travel.json'

export interface SearchItem {
  id: string
  title: string
  href: string
  type: 'page' | 'blog' | 'design' | 'travel'
  description?: string
  date?: string
  tags?: string[]
}

// Indexed alongside each item but not returned to callers: a plain-text
// excerpt of the item's markdown content for full-text matching.
interface SearchDocument extends SearchItem {
  content: string
}

const EXCERPT_LENGTH = 1000

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

const staticPages: Omit<SearchItem, 'id'>[] = [
  {
    title: 'home',
    href: '/',
    type: 'page',
    description: 'The homepage of this website.',
  },
  {
    title: 'notions',
    href: '/notions',
    type: 'page',
    description: 'The homepage of my Notion site.',
  },
  { title: 'blog', href: '/blog', type: 'page', description: 'My blog.' },
  {
    title: 'design',
    href: '/design',
    type: 'page',
    description: 'My design portfolio.',
  },
  {
    title: 'travel',
    href: '/travel',
    type: 'page',
    description: 'My past travels.',
  },
  {
    title: 'about',
    href: '/about',
    type: 'page',
    description: 'A bit about me.',
  },
  {
    title: 'sitemap',
    href: '/sitemap',
    type: 'page',
    description: 'A sitemap for this website.',
  },
  {
    title: 'subdomains',
    href: '/subdomains',
    type: 'page',
    description:
      'All the subdomains from michaeldemar.co. Basically, a link to all my other projects.',
  },
  {
    title: 'uses',
    href: '/uses',
    type: 'page',
    description: 'A Notion page of all the products I use.',
  },
  {
    title: 'quotes',
    href: '/quotes',
    type: 'page',
    description: 'A Notion page of some of my favorite quotes.',
  },
  {
    title: 'inspirations',
    href: '/inspirations',
    type: 'page',
    description: 'A Notion page of people I look up to.',
  },
  {
    title: 'til',
    href: '/til',
    type: 'page',
    description: 'A Notion page of things I learn everyday.',
  },
]

const documents: SearchDocument[] = [
  ...staticPages.map((page) => ({ ...page, id: page.href, content: '' })),
  ...blogData.posts.map((post) => ({
    id: post.id,
    title: post.title,
    href: `/blog/${post.slug}`,
    type: 'blog' as const,
    description: post.description,
    date: post.publishedDate || post.createdDate,
    tags: post.tags,
    content: markdownToExcerpt(post.content ?? ''),
  })),
  ...designData.projects.map((project) => ({
    id: project.id,
    title: project.title,
    href: `/design/${project.slug}`,
    type: 'design' as const,
    description: project.description,
    date: project.publishedDate || project.createdDate,
    tags: project.tags,
    content: markdownToExcerpt(project.content ?? ''),
  })),
  ...travelData.itineraries.map((itinerary) => ({
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

const miniSearch = new MiniSearch<SearchDocument>({
  fields: ['title', 'tags', 'description', 'content'],
  storeFields: ['title', 'href', 'type', 'description', 'date', 'tags'],
  searchOptions: {
    boost: { title: 5, tags: 3, description: 2 },
    prefix: true,
    fuzzy: 0.2,
  },
})

miniSearch.addAll(documents)

export const SEARCH_RESULTS_LIMIT = 15

export function searchSite(
  query: string,
  limit: number = SEARCH_RESULTS_LIMIT
): SearchItem[] {
  return miniSearch
    .search(query)
    .slice(0, limit)
    .map(({ id, title, href, type, description, date, tags }) => ({
      id,
      title,
      href,
      type,
      description,
      date,
      tags,
    }))
}
