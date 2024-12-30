import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import type { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
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
export const n2m = new NotionToMarkdown({ notionClient: notion })

// Utility functions
export function isFullPage(response: DatabaseObjectResponse): response is any {
  // PageObjectResponse
  return 'properties' in response
}

export function getRichTextContent(richText: any[]): string {
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

      // Preserve the original link format (image vs regular link)
      const newLink = altText
        ? `![${altText}](${localPath})`
        : `[${linkText}](${localPath})`
      processedContent = processedContent.replace(fullMatch, newLink)
    }
  }

  return processedContent
}

// Re-export everything from modules
export * from './types'
export * from './blog'
export * from './design'
export * from './travel'
