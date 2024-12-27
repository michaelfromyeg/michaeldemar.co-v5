// src/lib/notion-design.ts
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { DatabaseObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';

if (!process.env.NOTION_TOKEN) {
    throw new Error("Missing NOTION_TOKEN environment variable");
}

if (!process.env.NOTION_DESIGN_DATABASE_ID) {
    throw new Error("Missing NOTION_DESIGN_DATABASE_ID environment variable");
}

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export interface DesignImage {
    url: string;
    caption?: string;
    alt?: string;
}

export interface DesignProject {
    id: string;
    title: string;
    createdDate: string;
    editedDate: string | null;
    publishedDate: string | null;
    content: string;
    images: DesignImage[];
    status: string;
}

function isFullPage(response: DatabaseObjectResponse): response is PageObjectResponse {
    return 'properties' in response;
}

function getRichTextContent(richText: any[]): string {
    if (!richText || richText.length === 0) return "";
    return richText[0].plain_text;
}

async function downloadAndSaveImage(imageUrl: string, projectId: string): Promise<string> {
    try {
        const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
        const extension = path.extname(new URL(imageUrl).pathname) || '.jpg';
        const filename = `${urlHash}${extension}`;
        
        const imageDir = path.join(process.cwd(), 'public', 'design-images', projectId);
        await fs.mkdir(imageDir, { recursive: true });
        
        const imagePath = path.join(imageDir, filename);
        const publicPath = `/design-images/${projectId}/${filename}`;

        // Only download if doesn't exist
        if (!await fs.access(imagePath).then(() => true).catch(() => false)) {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            
            const buffer = await response.buffer();
            await fs.writeFile(imagePath, buffer);
            console.log(`Downloaded image: ${publicPath}`);
        }

        return publicPath;
    } catch (error) {
        console.error(`Failed to process image ${imageUrl}:`, error);
        return imageUrl;
    }
}

async function processImages(content: string, projectId: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((https:[^)]+)\)/g;
    let processedContent = content;
    const matches = [...content.matchAll(imageRegex)];

    for (const match of matches) {
        const [fullMatch, altText, imageUrl] = match;
        if (imageUrl.includes('prod-files-secure.s3')) {
            const localImagePath = await downloadAndSaveImage(imageUrl, projectId);
            processedContent = processedContent.replace(
                fullMatch,
                `![${altText}](${localImagePath})`
            );
        }
    }

    return processedContent;
}

async function getImagesFromPage(pageId: string): Promise<DesignImage[]> {
    const response = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
    });

    const images: DesignImage[] = [];

    for (const block of response.results) {
        if ('type' in block && block.type === 'image') {
            const image: DesignImage = {
                url: block.image.type === 'external' ? block.image.external.url : block.image.file.url,
                caption: block.image.caption?.[0]?.plain_text,
                alt: block.image.caption?.[0]?.plain_text || 'Design image'
            };
            images.push(image);
        }
    }

    return images;
}

function parseNotionPageToDesignProject(page: DatabaseObjectResponse): Partial<DesignProject> {
    if (!isFullPage(page)) {
        throw new Error('Invalid page object from Notion API');
    }

    const properties = page.properties;

    return {
        id: page.id,
        title: getRichTextContent(properties.Name?.['title'] ?? []),
        createdDate: properties.Created?.['created_time'] ?? "",
        editedDate: properties.Edited?.['last_edited_time'] ?? null,
        publishedDate: properties.Published?.['date']?.start ?? null,
        status: properties.Status?.['status']?.name ?? "",
    };
}

export async function generateDesignData(): Promise<{
    projects: DesignProject[];
}> {
    console.log('Querying Notion design database...');

    const response = await notion.databases.query({
        database_id: process.env.NOTION_DESIGN_DATABASE_ID!,
        filter: {
            property: "Status",
            status: {
                equals: "Done"
            }
        },
        sorts: [
            {
                property: "Published",
                direction: "descending",
            },
        ],
    });

    console.log(`Found ${response.results.length} design projects`);

    const projects = await Promise.all(
        response.results.map(async (page) => {
            console.log(`Processing design project ${page.id}...`);
            const project = parseNotionPageToDesignProject(page);
            
            // Get markdown content
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;
            
            // Process content
            markdown = await processImages(markdown, page.id);

            // Get images
            const images = await getImagesFromPage(page.id);
            
            // Process images
            const processedImages = await Promise.all(
                images.map(async (image) => ({
                    ...image,
                    url: await downloadAndSaveImage(image.url, page.id)
                }))
            );

            return {
                ...project,
                content: markdown,
                images: processedImages,
            } as DesignProject;
        })
    );

    console.log(`Successfully processed ${projects.length} design projects`);

    return { projects };
}