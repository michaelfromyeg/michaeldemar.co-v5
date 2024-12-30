// src/lib/notion/design.ts
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import {
  notion,
  n2m,
  isFullPage,
  getRichTextContent,
  normalizeContent,
  processContent,
  processFile,
} from './index'
import { getPageCoverImage } from './cover'
import type { DesignProject, DesignImage } from './types'
import { title } from 'process'

async function getImagesFromPage(pageId: string): Promise<DesignImage[]> {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  })

  const images: DesignImage[] = []
  for (const block of response.results) {
    if ('type' in block && block.type === 'image') {
      const image: DesignImage = {
        url:
          block.image.type === 'external'
            ? block.image.external.url
            : block.image.file.url,
        caption: block.image.caption?.[0]?.plain_text,
        alt: block.image.caption?.[0]?.plain_text || 'Design image',
      }
      images.push(image)
    }
  }
  return images
}

export function parseNotionPageToDesignProject(
  page: any
): Omit<DesignProject, 'content' | 'coverImage' | 'images'> {
  if (!isFullPage(page)) {
    throw new Error('Invalid page object from Notion API')
  }

  const properties = page.properties
  return {
    createdDate: properties.Created?.created_time ?? '',
    description: getRichTextContent(properties['One Liner']?.rich_text ?? []),
    editedDate: properties.Edited?.last_edited_time ?? null,
    id: page.id,
    publishedDate: properties.Published?.date?.start ?? null,
    slug: properties.Slug?.formula?.string ?? '',
    status: properties.Status?.status?.name ?? '',
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) ?? [],
    title: getRichTextContent(properties.Name?.title ?? []),
  }
}

export async function generateDesignData(): Promise<{
  projects: DesignProject[]
  projectsBySlug: Record<string, DesignProject>
}> {
  console.log('Querying Notion design database...')

  const response = await notion.databases.query({
    database_id: process.env.NOTION_DESIGN_DATABASE_ID!,
    filter: {
      and: [
        {
          property: 'Status',
          status: {
            equals: 'Done',
          },
        },
        {
          property: 'Slug',
          formula: {
            string: {
              is_not_empty: true,
            },
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Published',
        direction: 'descending',
      },
    ],
  })

  console.log(`Found ${response.results.length} design projects`)

  const projects = await Promise.all(
    response.results.map(async (page) => {
      console.log(`Processing design project ${page.id}...`)
      const project = parseNotionPageToDesignProject(page as PageObjectResponse)

      // Get cover image
      const coverImage = await getPageCoverImage(
        page as PageObjectResponse,
        'design',
        project.slug
      )

      const mdBlocks = await n2m.pageToMarkdown(page.id)
      let markdown = n2m.toMarkdownString(mdBlocks).parent
      const images = await getImagesFromPage(page.id)

      // Remove image markdown and clean up
      markdown = markdown.replace(/!\[([^\]]*)\]\([^)]+\)\n*/g, '')
      markdown = markdown.replace(
        /### [^\n]+\n+((?!#{1,3} ).*\n*)*(?:\n|$)/gm,
        ''
      )
      markdown = normalizeContent(markdown)

      // Process markdown content for any remaining files
      markdown = await processContent(markdown, 'design', project.slug)

      // Process design-specific images
      const processedImages = await Promise.all(
        images.map(async (image, index) => ({
          ...image,
          url: await processFile(image.url, {
            category: 'design',
            itemId: project.slug,
            index,
            prefix: 'content',
          }),
        }))
      )

      return {
        ...project,
        content: markdown,
        coverImage,
        images: processedImages,
      }
    })
  )

  console.log(`Successfully processed ${projects.length} design projects`)

  const projectsBySlug = projects.reduce<Record<string, DesignProject>>(
    (acc, project) => {
      acc[project.slug] = project
      return acc
    },
    {}
  )

  return { projects, projectsBySlug }
}
