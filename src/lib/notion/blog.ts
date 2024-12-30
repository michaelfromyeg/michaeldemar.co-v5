// src/lib/notion/blog.ts
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import {
  notion,
  n2m,
  isFullPage,
  getRichTextContent,
  normalizeContent,
  processContent,
} from './index'
import { getPageCoverImage } from './cover'
import type { BlogPost } from './types'

export function parseNotionPageToBlogPost(
  page: any
): Omit<BlogPost, 'content' | 'coverImage'> {
  if (!isFullPage(page)) {
    throw new Error('Invalid page object from Notion API')
  }

  const properties = page.properties

  return {
    id: page.id,
    slug: properties.Slug?.formula?.string ?? '',
    title: getRichTextContent(properties.Name?.title ?? []),
    description: getRichTextContent(properties['One Liner']?.rich_text ?? []),
    createdDate: properties.Created?.created_time ?? '',
    editedDate: properties.Edited?.last_edited_time ?? null,
    publishedDate: properties.Published?.date?.start ?? null,
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) ?? [],
    status: properties.Status?.status?.name ?? '',
  }
}

export async function generateBlogData(): Promise<{
  posts: BlogPost[]
  postsBySlug: Record<string, BlogPost>
}> {
  console.log('Querying Notion blog database...')

  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
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
      console.log(`Processing blog post ${page.id}...`)
      const post = parseNotionPageToBlogPost(page as PageObjectResponse)

      // Get cover image
      const coverImage = await getPageCoverImage(
        page as PageObjectResponse,
        'blog',
        post.slug
      )

      const mdBlocks = await n2m.pageToMarkdown(page.id)
      let markdown = n2m.toMarkdownString(mdBlocks).parent

      markdown = normalizeContent(markdown)
      markdown = await processContent(markdown, 'blog', post.slug)

      return {
        ...post,
        coverImage,
        content: markdown,
      }
    })
  )

  console.log(`Successfully processed ${posts.length} blog posts`)

  const postsBySlug = posts.reduce<Record<string, BlogPost>>((acc, post) => {
    acc[post.slug] = post
    return acc
  }, {})

  return { posts, postsBySlug }
}
