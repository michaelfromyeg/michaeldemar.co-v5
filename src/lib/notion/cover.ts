// src/lib/notion/cover.ts
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { downloadAndSaveImage } from './index'

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

  // Save cover image with a special prefix to distinguish it
  const localPath = await downloadAndSaveImage(
    coverUrl,
    category,
    itemId,
    0,
    'cover'
  )

  return localPath
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
