// src/lib/notion/cover.ts
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { processFile } from './index'

export interface CoverImage {
  url: string
  type: 'external' | 'file'
}

export async function getPageCoverImage(
  page: PageObjectResponse,
  category: 'blog' | 'design' | 'travel',
  itemId: string
): Promise<string | null> {
  if (!page.cover) return null

  const coverUrl =
    page.cover.type === 'external'
      ? page.cover.external.url
      : page.cover.file.url

  // For Unsplash URLs, remove query params to get original quality
  const processUrl = coverUrl.includes('unsplash.com')
    ? coverUrl.split('?')[0]
    : coverUrl

  return processFile(processUrl, {
    category,
    itemId,
    index: 0,
    prefix: 'cover',
  })
}

// Update types to include cover image
export interface BaseItem {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string | null
  createdDate: string
  editedDate: string | null
  publishedDate: string | null
  status: string
  content: string
}
