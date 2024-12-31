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
import type { TravelItinerary, Waypoint } from './types'

function parseNotionPageToWaypoint(page: any): Waypoint {
  if (!isFullPage(page)) {
    throw new Error('Invalid waypoint page object from Notion API')
  }

  const properties = page.properties
  const itineraryRelation = properties.Itineraries?.relation

  if (!itineraryRelation || itineraryRelation.length !== 1) {
    throw new Error('Waypoint must be connected to exactly one itinerary')
  }

  return {
    id: page.id,
    title: getRichTextContent(properties.Name?.title ?? []),
    notes: getRichTextContent(properties.Notes?.rich_text ?? []),
    latitude: properties.Latitude?.number ?? 0,
    longitude: properties.Longitude?.number ?? 0,
    date: properties.Date?.date?.start ?? '',
    duration: properties.Duration?.number ?? 0,
    itineraryId: itineraryRelation[0].id,
  }
}

function parseNotionPageToTravelItinerary(
  page: any,
  waypoints: Waypoint[] = []
): Omit<TravelItinerary, 'content' | 'coverImage' | 'blurDataURL'> {
  if (!isFullPage(page)) {
    throw new Error('Invalid page object from Notion API')
  }

  const properties = page.properties

  return {
    id: page.id,
    slug: properties.Slug?.formula?.string ?? '',
    title: getRichTextContent(properties.Name?.title ?? []),
    description: getRichTextContent(properties.Description?.rich_text ?? []),
    region: properties.Region?.select?.name ?? '',
    startDate: properties.Start?.date?.start ?? '',
    endDate: properties.Finish?.date?.start ?? '',
    waypoints: waypoints.filter((w) => w.itineraryId === page.id),
    createdDate: properties.Created?.created_time ?? '',
    editedDate: properties.Edited?.last_edited_time ?? null,
    publishedDate: null,
    status:
      new Date(properties.Finish?.date?.start ?? '') < new Date()
        ? 'Completed'
        : 'Planned',
  }
}

export async function generateTravelData(): Promise<{
  itineraries: TravelItinerary[]
  itinerariesBySlug: Record<string, TravelItinerary>
  itinerariesByRegion: Record<string, TravelItinerary[]>
}> {
  console.log('Querying Notion travel databases...')

  try {
    // First, fetch all waypoints
    const waypointsResponse = await notion.databases.query({
      database_id: process.env.NOTION_WAYPOINTS_DATABASE_ID!,
      sorts: [
        {
          property: 'Date',
          direction: 'ascending',
        },
      ],
    })

    console.log(`Found ${waypointsResponse.results.length} waypoints`)

    const waypoints = waypointsResponse.results.map((page) =>
      parseNotionPageToWaypoint(page as PageObjectResponse)
    )

    // Then fetch all itineraries
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
          {
            property: 'Done',
            checkbox: {
              equals: true,
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
            page as PageObjectResponse,
            waypoints
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
            ...parseNotionPageToTravelItinerary(
              page as PageObjectResponse,
              waypoints
            ),
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
