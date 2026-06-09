// src/lib/notion/design.ts
import type { PageObjectResponse } from '@notionhq/client'
import {
  notion,
  getRichTextContent,
  getDataSourceId,
  processPageContent,
  processFile,
  generateBlurDataURL,
  buildBySlug,
} from './index'
import type { DesignProject, DesignImage, NotionPageProperties } from './types'

async function getImagesFromPage(
  pageId: string
): Promise<Array<Omit<DesignImage, 'blurDataURL'>>> {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 100,
  })

  const images: Array<Omit<DesignImage, 'blurDataURL'>> = []
  for (const block of response.results) {
    if ('type' in block && block.type === 'image') {
      const image = {
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
  page: PageObjectResponse
): Omit<DesignProject, 'content' | 'coverImage' | 'blurDataURL' | 'images'> {
  const properties = page.properties as unknown as NotionPageProperties

  return {
    createdDate: properties.Created?.created_time ?? '',
    description: getRichTextContent(properties['One Liner']?.rich_text ?? []),
    editedDate: properties.Edited?.last_edited_time ?? null,
    id: page.id,
    publishedDate: properties.Published?.date?.start ?? null,
    slug: properties.Slug?.formula?.string ?? '',
    status: properties.Status?.status?.name ?? '',
    tags: properties.Tags?.multi_select?.map((tag) => tag.name) ?? [],
    title: getRichTextContent(properties.Name?.title ?? []),
  }
}

export async function generateDesignData(): Promise<{
  projects: DesignProject[]
  projectsBySlug: Record<string, DesignProject>
}> {
  console.log('Querying Notion design database...')

  const dataSourceId = await getDataSourceId(
    process.env.NOTION_DESIGN_DATABASE_ID!
  )

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
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
      const project = parseNotionPageToDesignProject(page as PageObjectResponse)
      try {
        console.log(`Processing design project ${page.id}...`)

        // Design pages render images via the gallery, so strip inline image
        // markdown and the per-image "### caption" sections from the body.
        const { coverImage, blurDataURL, content } = await processPageContent(
          page as PageObjectResponse,
          'design',
          project.slug,
          (markdown) =>
            markdown
              .replace(/!\[([^\]]*)\]\([^)]+\)\n*/g, '')
              .replace(/### [^\n]+\n+((?!#{1,3} ).*\n*)*(?:\n|$)/gm, '')
        )

        const images = await getImagesFromPage(page.id)
        const processedImages = await Promise.all(
          images.map(async (image, index) => {
            try {
              const processedUrl = await processFile(image.url, {
                category: 'design',
                itemId: project.slug,
                index,
                prefix: 'content',
              })
              const imageBlurDataURL = await generateBlurDataURL(
                image.url,
                `image ${index} in project ${project.slug}`
              )
              return {
                ...image,
                url: processedUrl,
                blurDataURL: imageBlurDataURL,
              }
            } catch (error) {
              console.error(
                `Failed to process image ${index} in project ${project.slug}:`,
                error instanceof Error ? error.message : error
              )
              return { ...image, blurDataURL: null }
            }
          })
        )

        return {
          ...project,
          content,
          coverImage,
          blurDataURL,
          images: processedImages,
        }
      } catch (error) {
        console.error(
          `Failed to process design project ${page.id}:`,
          error instanceof Error ? error.message : error
        )
        // Return a minimal valid project to prevent the entire build from failing
        return {
          ...project,
          content: '',
          coverImage: null,
          blurDataURL: null,
          images: [],
        }
      }
    })
  )

  console.log(`Successfully processed ${projects.length} design projects`)

  return { projects, projectsBySlug: buildBySlug(projects) }
}
