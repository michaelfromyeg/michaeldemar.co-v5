'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const CACHE_VERSION = '1.0'
const CACHE_KEY = 'search-data-cache'

type SearchItem = {
  id: string
  title: string
  href: string
  type: 'page' | 'blog' | 'travel' | 'design'
  description?: string
  date?: string
  tags?: string[]
  searchText: string
}

interface SearchContextValue {
  searchItems: SearchItem[]
  isLoading: boolean
}

const SearchContext = createContext<SearchContextValue>({
  searchItems: [],
  isLoading: true,
})

interface CacheData {
  version: string
  timestamp: number
  items: SearchItem[]
}

const staticPages: Omit<SearchItem, 'id' | 'searchText'>[] = [
  { title: 'home', href: '/', type: 'page' },
  { title: 'blog', href: '/blog', type: 'page' },
  { title: 'design', href: '/design', type: 'page' },
  { title: 'travel', href: '/travel', type: 'page' },
  { title: 'about', href: '/about', type: 'page' },
  { title: 'sitemap', href: '/sitemap', type: 'page' },
  { title: 'uses', href: '/uses', type: 'page' },
  { title: 'quotes', href: '/quotes', type: 'page' },
  { title: 'inspirations', href: '/inspirations', type: 'page' },
  { title: 'til', href: '/til', type: 'page' },
]

const prepareSearchText = (item: SearchItem): string => {
  return [item.title, item.description, item.type, item.tags?.join(' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SearchContextValue>({
    searchItems: [],
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true

    async function initializeSearchData() {
      console.log('Initializing search data...')

      try {
        // First try to load from cache
        console.log('Checking cache...')
        let searchItems: SearchItem[] = []

        try {
          const cached = localStorage?.getItem(CACHE_KEY)
          console.log('Cache raw value:', cached)

          if (cached) {
            const cacheData = JSON.parse(cached) as CacheData
            console.log('Parsed cache data:', cacheData)

            const cacheAge = Date.now() - cacheData.timestamp
            if (
              cacheData.version === CACHE_VERSION &&
              cacheAge < 60 * 60 * 1000
            ) {
              console.log('Using valid cache')
              searchItems = cacheData.items
              if (isMounted) {
                setState({
                  searchItems,
                  isLoading: false,
                })
              }
              return
            }
          }
        } catch (cacheError) {
          console.warn('Cache retrieval failed:', cacheError)
          // Clear potentially corrupted cache
          try {
            localStorage?.removeItem(CACHE_KEY)
          } catch (e) {
            console.warn('Failed to clear cache:', e)
          }
        }

        // If we get here, we need to fetch fresh data
        console.log('Fetching fresh data...')
        const [blogData, designData, travelData] = await Promise.all([
          import('@/data/blog.json').then((m) => m.default),
          import('@/data/design.json').then((m) => m.default),
          import('@/data/travel.json').then((m) => m.default),
        ])

        console.log('Transforming data...')
        searchItems = [
          ...staticPages.map((page) => ({
            ...page,
            id: page.href,
            searchText: prepareSearchText({
              ...page,
              id: page.href,
              searchText: '',
            }),
          })),
          ...blogData.posts.map((post) => ({
            id: post.id,
            title: post.title,
            href: `/blog/${post.slug}`,
            type: 'blog' as const,
            description: post.description,
            date: post.publishedDate || post.createdDate,
            tags: post.tags,
            searchText: '',
          })),
          ...designData.projects.map((project) => ({
            id: project.id,
            title: project.title,
            href: `/design/${project.slug}`,
            type: 'design' as const,
            description: project.description,
            date: project.publishedDate || project.createdDate,
            tags: project.tags,
            searchText: '',
          })),
          ...travelData.itineraries.map((itinerary) => ({
            id: itinerary.id,
            title: itinerary.title,
            href: `/travel/${itinerary.slug}`,
            type: 'travel' as const,
            description: itinerary.description,
            date: itinerary.startDate,
            searchText: '',
          })),
        ]

        // Prepare search text
        searchItems.forEach((item) => {
          item.searchText = prepareSearchText(item)
        })

        // Cache the prepared data
        console.log('Caching new data...')
        try {
          const cacheData: CacheData = {
            version: CACHE_VERSION,
            timestamp: Date.now(),
            items: searchItems,
          }
          localStorage?.setItem(CACHE_KEY, JSON.stringify(cacheData))
        } catch (cacheError) {
          console.warn('Failed to cache search data:', cacheError)
        }

        if (isMounted) {
          setState({
            searchItems,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Search initialization error:', error)
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    initializeSearchData()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <SearchContext.Provider value={state}>{children}</SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
