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

if (!process.env.NOTION_BLOG_DATABASE_ID) {
    throw new Error("Missing NOTION_BLOG_DATABASE_ID environment variable");
}

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    description: string;
    createdDate: string;
    editedDate: string | null;
    tags: string[];
    status: string;
    content?: string;
}

function isFullPage(response: DatabaseObjectResponse): response is PageObjectResponse {
    return 'properties' in response;
}

function getRichTextContent(richText: any[]): string {
    if (!richText || richText.length === 0) return "";
    return richText[0].plain_text;
}

function normalizeContent(content: string): string {
    return content
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n(#{1,6}.*)\n/g, '\n\n$1\n\n')
        .replace(/\n([*-].*)\n/g, '\n\n$1\n')
        .trim();
}

async function downloadAndSaveImage(imageUrl: string, slug: string): Promise<string> {
    try {
        const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
        const extension = path.extname(new URL(imageUrl).pathname) || '.jpg';
        const filename = `${urlHash}${extension}`;
        
        const imageDir = path.join(process.cwd(), 'public', 'blog-images', slug);
        await fs.mkdir(imageDir, { recursive: true });
        
        const imagePath = path.join(imageDir, filename);
        const publicPath = `/blog-images/${slug}/${filename}`;

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
        return imageUrl; // Fallback to original URL
    }
}

async function processImages(content: string, slug: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((https:[^)]+)\)/g;
    let processedContent = content;
    const matches = [...content.matchAll(imageRegex)];

    for (const match of matches) {
        const [fullMatch, altText, imageUrl] = match;
        if (imageUrl.includes('prod-files-secure.s3')) {
            const localImagePath = await downloadAndSaveImage(imageUrl, slug);
            processedContent = processedContent.replace(
                fullMatch,
                `![${altText}](${localImagePath})`
            );
        }
    }

    return processedContent;
}

function parseNotionPageToPost(page: DatabaseObjectResponse): BlogPost {
    if (!isFullPage(page)) {
        throw new Error('Invalid page object from Notion API');
    }

    const properties = page.properties;

    return {
        id: page.id,
        slug: properties.Slug?.['formula']?.string ?? "",
        title: getRichTextContent(properties.Name?.['title'] ?? []),
        description: getRichTextContent(properties['One Liner']?.['rich_text'] ?? []),
        createdDate: properties.Created?.['created_time'] ?? "",
        editedDate: properties.Edited?.['last_edited_time'] ?? null,
        tags: properties.Tags?.['multi_select']?.map((tag: any) => tag.name) ?? [],
        status: properties.Status?.['status']?.name ?? "",
    };
}

export async function generateBlogData(): Promise<{
    posts: BlogPost[];
    postsBySlug: Record<string, BlogPost>;
}> {
    console.log('Querying Notion database...');

    const response = await notion.databases.query({
        database_id: process.env.NOTION_BLOG_DATABASE_ID!,
        filter: {
            property: "Status",
            status: {
                equals: "Published"
            }
        },
        sorts: [
            {
                property: "Created",
                direction: "descending",
            },
        ],
    });

    console.log(`Found ${response.results.length} pages`);

    const posts = await Promise.all(
        response.results.map(async (page) => {
            console.log(`Processing page ${page.id}...`);
            const post = parseNotionPageToPost(page);
            
            // Get markdown content
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;
            
            // Process content
            markdown = normalizeContent(markdown);
            markdown = await processImages(markdown, post.slug);

            return {
                ...post,
                content: markdown,
            };
        })
    );

    console.log(`Successfully processed ${posts.length} posts`);

    // Create lookup by slug
    const postsBySlug = posts.reduce<Record<string, BlogPost>>((acc, post) => {
        acc[post.slug] = post;
        return acc;
    }, {});

    return {
        posts,
        postsBySlug,
    };
}