import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { fetchBuffer } from './fetch'

// Validate environment variables
const requiredEnvVars = {
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  NOTION_BLOG_DATABASE_ID: process.env.NOTION_BLOG_DATABASE_ID,
  NOTION_DESIGN_DATABASE_ID: process.env.NOTION_DESIGN_DATABASE_ID,
  NOTION_TRAVEL_DATABASE_ID: process.env.NOTION_TRAVEL_DATABASE_ID,
} as const

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing ${key} environment variable`)
})

// Initialize Notion client
export const notion = new Client({ auth: process.env.NOTION_TOKEN! })

// notion-to-md@3 only calls the (unchanged) blocks API, so it works with the
// v5 client at runtime; the cast satisfies its stale `@notionhq/client@^2` peer.
export const n2m = new NotionToMarkdown({
  notionClient:
    notion as unknown as ConstructorParameters<
      typeof NotionToMarkdown
    >[0]['notionClient'],
})

// As of API version 2025-09-03 a database is queried through one of its data
// sources, not the database id. Resolve and cache databaseId -> dataSourceId.
const dataSourceIdCache = new Map<string, string>()

export async function getDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceIdCache.get(databaseId)
  if (cached) return cached

  const database = await notion.databases.retrieve({ database_id: databaseId })
  const dataSources = (
    database as { data_sources?: Array<{ id: string }> }
  ).data_sources

  if (!dataSources?.length) {
    throw new Error(`Database ${databaseId} has no data sources`)
  }

  const id = dataSources[0].id
  dataSourceIdCache.set(databaseId, id)
  return id
}

export function getRichTextContent(
  richText: Array<{ plain_text: string }>
): string {
  if (!richText?.length) return ''
  return richText[0].plain_text
}

export function normalizeContent(content: string | undefined): string {
  if (content === undefined) {
    return ''
  }

  return content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n(#{1,6}.*)\n/g, '\n\n$1\n\n')
    .replace(/\n([*-].*)\n/g, '\n\n$1\n')
    .trim()
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

function extractFilename(url: string): { basename: string; extension: string } {
  // Handle S3 URLs
  const s3Match = url.match(/original_([^?]+)/)
  if (s3Match) {
    const filename = s3Match[1]
    return {
      basename: path.basename(filename, path.extname(filename)),
      extension: path.extname(filename).toLowerCase(),
    }
  }

  // Handle Unsplash URLs
  if (url.includes('unsplash.com')) {
    const photoId = url.split('/').pop()?.split('?')[0] || 'photo'
    return {
      basename: photoId,
      extension: '.jpg', // Unsplash photos are typically JPG
    }
  }

  // Default handling
  try {
    const urlPath = new URL(url).pathname
    const lastSegment = urlPath.split('/').pop() || 'image.jpg'
    return {
      basename: path.basename(lastSegment, path.extname(lastSegment)),
      extension: path.extname(lastSegment).toLowerCase() || '.jpg',
    }
  } catch {
    return { basename: 'image', extension: '.jpg' }
  }
}

interface FileProcessingOptions {
  category: 'blog' | 'design' | 'travel'
  itemId: string
  index: number
  prefix?: 'cover' | 'content'
}

export async function processFile(
  fileUrl: string,
  options: FileProcessingOptions
): Promise<string> {
  try {
    const { category, itemId, index, prefix = 'content' } = options
    const { basename, extension } = extractFilename(fileUrl)

    // Always process images to webp
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(
      extension
    )
    const outputExtension = isImage ? '.webp' : extension

    const filename =
      prefix === 'cover'
        ? `cover-${basename}${outputExtension}`
        : `${index.toString().padStart(3, '0')}-${basename}${outputExtension}`

    const fileDir = path.join(
      process.cwd(),
      'public',
      `${category}-files`,
      itemId
    )
    const filePath = path.join(fileDir, filename)
    const publicPath = `/${category}-files/${itemId}/${filename}`

    if (await fileExists(filePath)) {
      console.log(`File already exists: ${publicPath}`)
      return publicPath
    }

    await fs.mkdir(fileDir, { recursive: true })

    const buffer = await fetchBuffer(fileUrl)

    if (isImage) {
      await sharp(buffer)
        .resize({
          width: prefix === 'cover' ? 1920 : 1920,
          height: prefix === 'cover' ? 1080 : 1080,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
          effort: 6,
        })
        .toFile(filePath)
    } else {
      await fs.writeFile(filePath, buffer)
    }

    console.log(`Processed and saved file: ${publicPath}`)
    return publicPath
  } catch (error) {
    console.error(
      `Failed to process file ${fileUrl}:`,
      error instanceof Error ? error.message : error
    )
    return fileUrl // Fallback to original URL if processing fails
  }
}

export async function processContent(
  content: string,
  category: 'blog' | 'design' | 'travel',
  itemId: string
): Promise<string> {
  // Match both Markdown links and inline links
  const linkRegex = /(?:!\[([^\]]*)\]|\[([^\]]*)\])\((https:[^)]+)\)/g
  let processedContent = content
  const matches = [...content.matchAll(linkRegex)]

  for (let i = 0; i < matches.length; i++) {
    const [fullMatch, altText, linkText, url] = matches[i]
    if (url.includes('prod-files-secure.s3')) {
      const localPath = await processFile(url, {
        category,
        itemId,
        index: i,
      })

      const isFilename =
        altText &&
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?)$/i.test(altText.trim())

      // Preserve the original link format (image vs regular link)
      const newLink =
        altText && !isFilename
          ? `![${altText}](${localPath})`
          : linkText
            ? `[${linkText}](${localPath})`
            : `![](${localPath})` // Empty alt text for images with filename-like alt text

      processedContent = processedContent.replace(fullMatch, newLink)
    }
  }

  return processedContent
}

// Resolve a page's cover image to a local webp path plus a blur placeholder.
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

    const processedUrl = await processFile(processUrl, {
      category,
      itemId,
      index: 0,
      prefix: 'cover',
    })

    const blurDataURL = await generateBlurDataURL(processUrl, itemId)

    return { url: processedUrl, blurDataURL }
  } catch (error) {
    console.error(
      `Failed to process cover image for ${itemId}:`,
      error instanceof Error ? error.message : error
    )
    return { url: null, blurDataURL: null }
  }
}

// Build a tiny base64 webp blur placeholder for an image URL.
export async function generateBlurDataURL(
  url: string,
  label: string
): Promise<string | null> {
  try {
    const buffer = await fetchBuffer(url)
    const blur = await sharp(buffer)
      .resize(10, 10, { fit: 'inside' })
      .webp({ quality: 20 })
      .toBuffer()
    return `data:image/webp;base64,${blur.toString('base64')}`
  } catch (error) {
    console.warn(
      `Failed to generate blur placeholder for ${label}:`,
      error instanceof Error ? error.message : error
    )
    return null
  }
}

// Shared per-page pipeline: cover image + Notion blocks -> normalized markdown
// with local asset URLs. `transformMarkdown` lets a caller (e.g. design) strip
// content before normalization.
export async function processPageContent(
  page: PageObjectResponse,
  category: 'blog' | 'design' | 'travel',
  slug: string,
  transformMarkdown?: (markdown: string) => string
): Promise<{
  coverImage: string | null
  blurDataURL: string | null
  content: string
}> {
  const { url: coverImage, blurDataURL } = await getPageCoverImage(
    page,
    category,
    slug
  )

  const mdBlocks = await n2m.pageToMarkdown(page.id)
  let markdown = n2m.toMarkdownString(mdBlocks).parent
  if (transformMarkdown) markdown = transformMarkdown(markdown)
  markdown = normalizeContent(markdown)
  markdown = await processContent(markdown, category, slug)

  return { coverImage, blurDataURL, content: markdown }
}

export function buildBySlug<T extends { slug: string }>(
  items: T[]
): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.slug] = item
    return acc
  }, {})
}

// Re-export everything from modules
export * from './types'
export * from './blog'
export * from './design'
export * from './travel'
