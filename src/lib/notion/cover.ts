// src/lib/notion/cover.ts
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { processFile } from './index'
import sharp from 'sharp'
import { fetchBuffer } from './fetch'

export async function getPageCoverImage(
  page: PageObjectResponse,
  category: 'blog' | 'design' | 'travel',
  itemId: string
): Promise<{ url: string | null; blurDataURL: string | null }> {
  if (!page.cover) return { url: null, blurDataURL: null }

  try {
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
    let blurDataURL: string | null = null
    try {
      const buffer = await fetchBuffer(processUrl)
      blurDataURL = await sharp(buffer)
        .resize(10, 10, { fit: 'inside' })
        .webp({ quality: 20 })
        .toBuffer()
        .then((buf) => `data:image/webp;base64,${buf.toString('base64')}`)
    } catch (error) {
      console.warn(
        `Failed to generate blur placeholder for ${itemId}:`,
        error instanceof Error ? error.message : error
      )
      blurDataURL = null
    }

    return {
      url: processedUrl,
      blurDataURL,
    }
  } catch (error) {
    console.error(
      `Failed to process cover image for ${itemId}:`,
      error instanceof Error ? error.message : error
    )
    return { url: null, blurDataURL: null }
  }
}
