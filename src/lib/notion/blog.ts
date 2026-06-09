// src/lib/notion/blog.ts
import type { PageObjectResponse } from '@notionhq/client'
import {
  notion,
  getRichTextContent,
  getDataSourceId,
  processPageContent,
  buildBySlug,
} from './index'
import type { BlogPost, NotionPageProperties } from './types'

export function parseNotionPageToBlogPost(
  page: PageObjectResponse
): Omit<BlogPost, 'content' | 'coverImage' | 'blurDataURL'> {
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

export async function generateBlogData(): Promise<{
  posts: BlogPost[]
  postsBySlug: Record<string, BlogPost>
}> {
  console.log('Querying Notion blog database...')

  const dataSourceId = await getDataSourceId(
    process.env.NOTION_BLOG_DATABASE_ID!
  )

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: 'Status',
          status: {
            equals: 'Published',
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

  console.log(`Found ${response.results.length} blog posts`)

  const posts = await Promise.all(
    response.results.map(async (page) => {
      const post = parseNotionPageToBlogPost(page as PageObjectResponse)
      try {
        console.log(`Processing blog post ${page.id}...`)
        const { coverImage, blurDataURL, content } = await processPageContent(
          page as PageObjectResponse,
          'blog',
          post.slug
        )
        return { ...post, coverImage, blurDataURL, content }
      } catch (error) {
        console.error(
          `Failed to process blog post ${page.id}:`,
          error instanceof Error ? error.message : error
        )
        return { ...post, content: '', coverImage: null, blurDataURL: null }
      }
    })
  )

  console.log(`Successfully processed ${posts.length} blog posts`)

  return { posts, postsBySlug: buildBySlug(posts) }
}
