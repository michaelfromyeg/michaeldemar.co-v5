// src/lib/notion/travel.ts
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
import type { TravelItinerary } from './types'

export function parseNotionPageToTravelItinerary(
  page: any
): Omit<TravelItinerary, 'content' | 'coverImage' | 'blurDataURL'> {
  if (!isFullPage(page)) {
    throw new Error('Invalid page object from Notion API')
  }

  const properties = page.properties
  const startDate = properties.Start?.date?.start ?? ''
  const endDate = properties.Finish?.date?.start ?? ''
  const duration =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 0

  return {
    id: page.id,
    slug: properties.Slug?.formula?.string ?? '',
    title: getRichTextContent(properties.Name?.title ?? []),
    description: getRichTextContent(properties.Description?.rich_text ?? []),
    region: properties.Region?.select?.name ?? '',
    isDone: properties.Done?.checkbox ?? false,
    startDate,
    endDate,
    duration,
    lat: properties.Latitude?.number ?? 0,
    lon: properties.Longitude?.number ?? 0,
    createdDate: properties.Created?.created_time ?? '',
    editedDate: properties.Edited?.last_edited_time ?? null,
    publishedDate: null,
    status: properties.Done?.checkbox ? 'Completed' : 'Planned',
  }
}

export async function generateTravelData(): Promise<{
  itineraries: TravelItinerary[]
  itinerariesBySlug: Record<string, TravelItinerary>
  itinerariesByRegion: Record<string, TravelItinerary[]>
}> {
  console.log('Querying Notion travel database...')

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_TRAVEL_DATABASE_ID!,
      filter: {
        and: [
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
          property: 'Start',
          direction: 'descending',
        },
      ],
    })

    console.log(`Found ${response.results.length} travel itineraries`)

    const itineraries = await Promise.all(
      response.results.map(async (page) => {
        try {
          console.log(`Processing travel itinerary ${page.id}...`)
          const itinerary = parseNotionPageToTravelItinerary(
            page as PageObjectResponse
          )

          // Get cover image with blur data URL
          const { url: coverImage, blurDataURL } = await getPageCoverImage(
            page as PageObjectResponse,
            'travel',
            itinerary.slug
          )

          const mdBlocks = await n2m.pageToMarkdown(page.id)
          let markdown = n2m.toMarkdownString(mdBlocks).parent

          markdown = normalizeContent(markdown)
          markdown = await processContent(markdown, 'travel', itinerary.slug)

          return {
            ...itinerary,
            coverImage,
            blurDataURL,
            content: markdown,
          }
        } catch (error) {
          console.error(
            `Failed to process travel itinerary ${page.id}:`,
            error instanceof Error ? error.message : error
          )
          // Return a minimal valid itinerary to prevent the entire build from failing
          return {
            ...parseNotionPageToTravelItinerary(page as PageObjectResponse),
            content: '',
            coverImage: null,
            blurDataURL: null,
          }
        }
      })
    )

    console.log(
      `Successfully processed ${itineraries.length} travel itineraries`
    )

    // Filter out any failed itineraries that don't have required fields
    const validItineraries = itineraries.filter(
      (itinerary) => itinerary.slug && itinerary.region
    )

    if (validItineraries.length < itineraries.length) {
      console.warn(
        `Filtered out ${
          itineraries.length - validItineraries.length
        } invalid itineraries`
      )
    }

    const itinerariesBySlug = validItineraries.reduce<
      Record<string, TravelItinerary>
    >((acc, itinerary) => {
      acc[itinerary.slug] = itinerary
      return acc
    }, {})

    const itinerariesByRegion = validItineraries.reduce<
      Record<string, TravelItinerary[]>
    >((acc, itinerary) => {
      if (!acc[itinerary.region]) {
        acc[itinerary.region] = []
      }
      acc[itinerary.region].push(itinerary)
      return acc
    }, {})

    return {
      itineraries: validItineraries,
      itinerariesBySlug,
      itinerariesByRegion,
    }
  } catch (error) {
    console.error(
      'Fatal error generating travel data:',
      error instanceof Error ? error.message : error
    )
    // Return empty data structures rather than crashing
    return {
      itineraries: [],
      itinerariesBySlug: {},
      itinerariesByRegion: {},
    }
  }
}
