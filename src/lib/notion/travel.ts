// src/lib/notion/travel.ts
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, n2m, isFullPage, getRichTextContent, normalizeContent, processImages } from './index';
import type { TravelItinerary } from './types';

export function parseNotionPageToTravelItinerary(page: DatabaseObjectResponse): TravelItinerary {
    if (!isFullPage(page)) {
        throw new Error('Invalid page object from Notion API');
    }

    const properties = page.properties;
    const startDate = properties.Start?.['date']?.start ?? "";
    const endDate = properties.Finish?.['date']?.start ?? "";
    
    // Calculate duration in days
    const duration = startDate && endDate ? 
        Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 
        0;

    return {
        id: page.id,
        // Handle explicit Slug field, fallback to formula if not present
        slug: properties.Slug?.['rich_text']?.[0]?.plain_text ?? 
              properties.Slug?.['formula']?.string ?? "",
        title: getRichTextContent(properties.Name?.['title'] ?? []),
        description: getRichTextContent(properties.Description?.['rich_text'] ?? []),
        region: properties.Region?.['select']?.name ?? "",
        isDone: properties.Done?.['checkbox'] ?? false,
        startDate,
        endDate,
        duration,
        lat: properties.Latitude?.['number'] ?? 0,
        lon: properties.Longitude?.['number'] ?? 0,
        createdDate: properties.Created?.['created_time'] ?? "",
        editedDate: properties.Edited?.['last_edited_time'] ?? null,
        publishedDate: null,  // Travel itineraries don't use this field
        status: properties.Done?.['checkbox'] ? "Completed" : "Planned",
        content: "",  // Will be populated later if needed
    };
}

export async function generateTravelData(): Promise<{
    itineraries: TravelItinerary[];
    itinerariesBySlug: Record<string, TravelItinerary>;
    itinerariesByRegion: Record<string, TravelItinerary[]>;
}> {
    console.log('Querying Notion travel database...');

    const response = await notion.databases.query({
        database_id: process.env.NOTION_TRAVEL_DATABASE_ID!,
        filter: {
            property: "Slug",
            rich_text: {
                is_not_empty: true
            }
        },
        sorts: [
            {
                property: "Start",
                direction: "descending",
            },
        ],
    });

    console.log(`Found ${response.results.length} travel itineraries`);

    const itineraries = await Promise.all(
        response.results.map(async (page) => {
            console.log(`Processing travel itinerary ${page.id}...`);
            const itinerary = parseNotionPageToTravelItinerary(page);
            
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;
            
            markdown = normalizeContent(markdown);
            markdown = await processImages(markdown, 'travel', itinerary.slug);

            return {
                ...itinerary,
                content: markdown,
            };
        })
    );

    console.log(`Successfully processed ${itineraries.length} travel itineraries`);

    // Create lookup by slug
    const itinerariesBySlug = itineraries.reduce<Record<string, TravelItinerary>>((acc, itinerary) => {
        acc[itinerary.slug] = itinerary;
        return acc;
    }, {});

    // Create lookup by region
    const itinerariesByRegion = itineraries.reduce<Record<string, TravelItinerary[]>>((acc, itinerary) => {
        if (!acc[itinerary.region]) {
            acc[itinerary.region] = [];
        }
        acc[itinerary.region].push(itinerary);
        return acc;
    }, {});

    return { itineraries, itinerariesBySlug, itinerariesByRegion };
}