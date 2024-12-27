// src/lib/notion/index.ts
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { DatabaseObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Types
interface BaseNotionItem {
    id: string;
    slug: string;
    title: string;
    createdDate: string;
    editedDate: string | null;
    publishedDate: string | null;
    status: string;
    content?: string;
}

export interface BlogPost extends BaseNotionItem {
    description: string;
    tags: string[];
}

export interface DesignImage {
    url: string;
    caption?: string;
    alt?: string;
}

export interface DesignProject extends BaseNotionItem {
    description?: string;
    images: DesignImage[];
}

// Environment validation
const requiredEnvVars = {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_BLOG_DATABASE_ID: process.env.NOTION_BLOG_DATABASE_ID,
    NOTION_DESIGN_DATABASE_ID: process.env.NOTION_DESIGN_DATABASE_ID,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) throw new Error(`Missing ${key} environment variable`);
});

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Base utility functions
function isFullPage(response: DatabaseObjectResponse): response is PageObjectResponse {
    return 'properties' in response;
}

function getRichTextContent(richText: any[]): string {
    if (!richText?.length) return "";
    return richText[0].plain_text;
}

function normalizeContent(content: string): string {
    return content
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n(#{1,6}.*)\n/g, '\n\n$1\n\n')
        .replace(/\n([*-].*)\n/g, '\n\n$1\n')
        .trim();
}

async function fileExists(filepath: string): Promise<boolean> {
    try {
        await fs.access(filepath);
        return true;
    } catch {
        return false;
    }
}

// Image handling functions
function extractS3Filename(url: string): string {
    try {
        // Extract the filename from the S3 URL
        // Example URL: https://*.s3.amazonaws.com/*/original_<filename>
        const match = url.match(/original_([^?]+)/);
        if (match) {
            return match[1];
        }
        
        // Fallback to URL path if no match
        const urlPath = new URL(url).pathname;
        const lastSegment = urlPath.split('/').pop();
        return lastSegment || 'image.jpg';
    } catch (error) {
        console.error('Error extracting filename:', error);
        return 'image.jpg';
    }
}

async function downloadAndSaveImage(
    imageUrl: string, 
    category: 'blog' | 'design', 
    itemId: string,
    index: number
): Promise<string> {
    try {
        const originalFilename = extractS3Filename(imageUrl);
        // Add index prefix to filename for uniqueness
        const extension = path.extname(originalFilename);
        const basename = path.basename(originalFilename, extension);
        const filename = `${index.toString().padStart(3, '0')}-${basename}${extension}`;
        
        const imageDir = path.join(process.cwd(), 'public', `${category}-images`, itemId);
        const imagePath = path.join(imageDir, filename);
        const publicPath = `/${category}-images/${itemId}/${filename}`;

        // Check if image exists before downloading
        if (await fileExists(imagePath)) {
            console.log(`Image already exists: ${publicPath}`);
            return publicPath;
        }

        // Download and save the image
        await fs.mkdir(imageDir, { recursive: true });
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const buffer = await response.buffer();
        await fs.writeFile(imagePath, buffer);
        console.log(`Downloaded image: ${publicPath}`);

        return publicPath;
    } catch (error) {
        console.error(`Failed to process image ${imageUrl}:`, error);
        return imageUrl; // Fallback to original URL
    }
}

async function processImages(
    content: string, 
    category: 'blog' | 'design', 
    itemId: string
): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((https:[^)]+)\)/g;
    let processedContent = content;
    const matches = [...content.matchAll(imageRegex)];

    for (let i = 0; i < matches.length; i++) {
        const [fullMatch, altText, imageUrl] = matches[i];
        if (imageUrl.includes('prod-files-secure.s3')) {
            const localImagePath = await downloadAndSaveImage(imageUrl, category, itemId, i);
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
    let imageIndex = 0;

    for (const block of response.results) {
        if ('type' in block && block.type === 'image') {
            const image: DesignImage = {
                url: block.image.type === 'external' ? 
                    block.image.external.url : 
                    block.image.file.url,
                caption: block.image.caption?.[0]?.plain_text,
                alt: block.image.caption?.[0]?.plain_text || 'Design image'
            };
            images.push(image);
            imageIndex++;
        }
    }

    return images;
}

// Notion page parsers
function parseNotionPageToBlogPost(page: DatabaseObjectResponse): BlogPost {
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
        publishedDate: properties.Published?.['date']?.start ?? null,
        tags: properties.Tags?.['multi_select']?.map((tag: any) => tag.name) ?? [],
        status: properties.Status?.['status']?.name ?? "",
    };
}

function parseNotionPageToDesignProject(page: DatabaseObjectResponse): Omit<DesignProject, 'images'> {
    if (!isFullPage(page)) {
        throw new Error('Invalid page object from Notion API');
    }

    const properties = page.properties;

    return {
        id: page.id,
        slug: properties.Slug?.['formula']?.string ?? "",
        title: getRichTextContent(properties.Name?.['title'] ?? []),
        description: getRichTextContent(properties.Description?.['rich_text'] ?? []),
        createdDate: properties.Created?.['created_time'] ?? "",
        editedDate: properties.Edited?.['last_edited_time'] ?? null,
        publishedDate: properties.Published?.['date']?.start ?? null,
        status: properties.Status?.['status']?.name ?? "",
    };
}

// Data generators
async function generateBlogData(): Promise<{
    posts: BlogPost[];
    postsBySlug: Record<string, BlogPost>;
}> {
    console.log('Querying Notion blog database...');

    const response = await notion.databases.query({
        database_id: process.env.NOTION_BLOG_DATABASE_ID!,
        filter: {
            and: [
                {
                    property: "Status",
                    status: {
                        equals: "Published"
                    }
                },
                {
                    property: "Slug",
                    formula: {
                        string: {
                            is_not_empty: true
                        }
                    }
                }
            ]
        },
        sorts: [
            {
                property: "Published",
                direction: "descending",
            },
        ],
    });

    console.log(`Found ${response.results.length} blog posts`);

    const posts = await Promise.all(
        response.results.map(async (page) => {
            console.log(`Processing blog post ${page.id}...`);
            const post = parseNotionPageToBlogPost(page);
            
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;
            
            markdown = normalizeContent(markdown);
            markdown = await processImages(markdown, 'blog', post.slug);

            return {
                ...post,
                content: markdown,
            };
        })
    );

    console.log(`Successfully processed ${posts.length} blog posts`);

    const postsBySlug = posts.reduce<Record<string, BlogPost>>((acc, post) => {
        acc[post.slug] = post;
        return acc;
    }, {});

    return { posts, postsBySlug };
}

async function generateDesignData(): Promise<{
    projects: DesignProject[];
    projectsBySlug: Record<string, DesignProject>;
}> {
    console.log('Querying Notion design database...');

    const response = await notion.databases.query({
        database_id: process.env.NOTION_DESIGN_DATABASE_ID!,
        filter: {
            and: [
                {
                    property: "Status",
                    status: {
                        equals: "Done"
                    }
                },
                {
                    property: "Slug",
                    formula: {
                        string: {
                            is_not_empty: true
                        }
                    }
                }
            ]
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
            
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;
            
            const images = await getImagesFromPage(page.id);
            
            markdown = markdown.replace(/!\[([^\]]*)\]\([^)]+\)\n*/g, '');
            
            const processedImages = await Promise.all(
                images.map(async (image, index) => ({
                    ...image,
                    url: await downloadAndSaveImage(image.url, 'design', project.slug, index)
                }))
            );

            return {
                ...project,
                content: markdown,
                images: processedImages,
            };
        })
    );

    console.log(`Successfully processed ${projects.length} design projects`);

    const projectsBySlug = projects.reduce<Record<string, DesignProject>>((acc, project) => {
        acc[project.slug] = project;
        return acc;
    }, {});

    return { projects, projectsBySlug };
}

// Export unified interface
export async function generateNotionData() {
    const [blogData, designData] = await Promise.all([
        generateBlogData(),
        generateDesignData()
    ]);

    return {
        blog: blogData,
        design: designData
    };
}

export type { DatabaseObjectResponse, PageObjectResponse };