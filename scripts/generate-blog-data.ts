import 'dotenv/config';
import { generateBlogData } from '../src/lib/notion';
import fs from 'fs/promises';
import path from 'path';

async function main() {
    try {
        console.log('Generating blog data from Notion...');
        const blogData = await generateBlogData();

        // Ensure the data directory exists
        const dataDir = path.join(process.cwd(), 'src/data');
        await fs.mkdir(dataDir, { recursive: true });

        // Write the blog data to JSON
        await fs.writeFile(
            path.join(dataDir, 'blog.json'),
            JSON.stringify(blogData, null, 2)
        );

        console.log('✨ Blog data generated successfully!');
    } catch (error) {
        console.error('Error generating blog data:', error);
        process.exit(1);
    }
}

main();