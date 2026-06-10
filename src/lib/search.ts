import MiniSearch from 'minisearch'
import searchIndex from '@/data/search-index.json'

export interface SearchItem {
  id: string
  title: string
  href: string
  type: 'page' | 'blog' | 'design' | 'travel'
  description?: string
  date?: string
  tags?: string[]
  // Pages that 308-redirect off-site (next.config.ts); these need a hard
  // navigation since router.push can't follow cross-origin redirects.
  external?: boolean
}

// Shape of the entries in search-index.json, built by
// scripts/search-index.ts: each item plus a plain-text excerpt of its
// markdown content for full-text matching.
type SearchDocument = SearchItem & { content: string }

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
    external: true,
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
    external: true,
  },
  {
    title: 'quotes',
    href: '/quotes',
    type: 'page',
    description: 'A Notion page of some of my favorite quotes.',
    external: true,
  },
  {
    title: 'inspirations',
    href: '/inspirations',
    type: 'page',
    description: 'A Notion page of people I look up to.',
    external: true,
  },
  {
    title: 'til',
    href: '/til',
    type: 'page',
    description: 'A Notion page of things I learn everyday.',
    external: true,
  },
]

const documents: SearchDocument[] = [
  ...staticPages.map((page) => ({ ...page, id: page.href, content: '' })),
  ...(searchIndex as SearchDocument[]),
]

const miniSearch = new MiniSearch<SearchDocument>({
  fields: ['title', 'tags', 'description', 'content'],
  storeFields: [
    'title',
    'href',
    'type',
    'description',
    'date',
    'tags',
    'external',
  ],
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
    .map(({ id, title, href, type, description, date, tags, external }) => ({
      id,
      title,
      href,
      type,
      description,
      date,
      tags,
      external,
    }))
}
