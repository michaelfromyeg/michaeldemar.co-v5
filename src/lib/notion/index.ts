import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import type { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

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

function extractS3Filename(url: string): string {
  try {
    const match = url.match(/original_([^?]+)/)
    if (match) {
      return match[1]
    }

    const urlPath = new URL(url).pathname
    const lastSegment = urlPath.split('/').pop()
    return lastSegment || 'image.jpg'
  } catch (error) {
    console.error('Error extracting filename:', error)
    return 'image.jpg'
  }
}

export async function downloadAndSaveImage(
  imageUrl: string,
  category: 'blog' | 'design' | 'travel',
  itemId: string,
  index: number
): Promise<string> {
  try {
    const originalFilename = extractS3Filename(imageUrl)
    const extension = path.extname(originalFilename)
    const basename = path.basename(originalFilename, extension)
    const filename = `${index.toString().padStart(3, '0')}-${basename}${extension}`

    const imageDir = path.join(
      process.cwd(),
      'public',
      `${category}-images`,
      itemId
    )
    const imagePath = path.join(imageDir, filename)
    const publicPath = `/${category}-images/${itemId}/${filename}`

    if (await fileExists(imagePath)) {
      console.log(`Image already exists: ${publicPath}`)
      return publicPath
    }

    await fs.mkdir(imageDir, { recursive: true })
    const response = await fetch(imageUrl)
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`)

    const buffer = await response.buffer()
    await fs.writeFile(imagePath, buffer)
    console.log(`Downloaded image: ${publicPath}`)

    return publicPath
  } catch (error) {
    console.error(`Failed to process image ${imageUrl}:`, error)
    return imageUrl
  }
}

export async function processImages(
  content: string,
  category: 'blog' | 'design' | 'travel',
  itemId: string
): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\((https:[^)]+)\)/g
  let processedContent = content
  const matches = [...content.matchAll(imageRegex)]

  for (let i = 0; i < matches.length; i++) {
    const [fullMatch, altText, imageUrl] = matches[i]
    if (imageUrl.includes('prod-files-secure.s3')) {
      const localImagePath = await downloadAndSaveImage(
        imageUrl,
        category,
        itemId,
        i
      )
      processedContent = processedContent.replace(
        fullMatch,
        `![${altText}](${localImagePath})`
      )
    }
  }

  return processedContent
}

// Re-export everything from modules
export * from './types'
export * from './blog'
export * from './design'
export * from './travel'
