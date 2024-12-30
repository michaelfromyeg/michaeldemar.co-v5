// src/lib/notion/cover.ts
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { processFile } from './index'
import sharp from 'sharp'

export interface CoverImage {
  url: string
  type: 'external' | 'file'
  blurDataURL?: string
}

export async function getPageCoverImage(
  page: PageObjectResponse,
  category: 'blog' | 'design' | 'travel',
  itemId: string
): Promise<{ url: string | null; blurDataURL: string | null }> {
  if (!page.cover) return { url: null, blurDataURL: null }

  const coverUrl =
    page.cover.type === 'external'
      ? page.cover.external.url
      : page.cover.file.url

  // For Unsplash URLs, remove query params to get original quality
  const processUrl = coverUrl.includes('unsplash.com')
    ? coverUrl.split('?')[0]
    : coverUrl

  // Process the main image
  const processedUrl = await processFile(processUrl, {
    category,
    itemId,
    index: 0,
    prefix: 'cover',
  })

  // Generate blur placeholder
  const response = await fetch(processUrl)
  const buffer = Buffer.from(await response.arrayBuffer())

  const blurDataURL = await sharp(buffer)
    .resize(10, 10, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer()
    .then((buf) => `data:image/webp;base64,${buf.toString('base64')}`)
    .catch(() => null)

  return {
    url: processedUrl,
    blurDataURL,
  }
}

// Update types to include cover image and blur data URL
export interface BaseItem {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string | null
  blurDataURL: string | null
  createdDate: string
  editedDate: string | null
  publishedDate: string | null
  status: string
  content: string
}
