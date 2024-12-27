// scripts/generate-data.ts
import 'dotenv/config';
import { generateNotionData } from '../src/lib/notion';
import fs from 'fs/promises';
import path from 'path';

async function main() {
    try {
        console.log('Generating data from Notion...');
        const data = await generateNotionData();

        // Ensure the data directory exists
        const dataDir = path.join(process.cwd(), 'src/data');
        await fs.mkdir(dataDir, { recursive: true });

        // Write blog data
        await fs.writeFile(
            path.join(dataDir, 'blog.json'),
            JSON.stringify(data.blog, null, 2)
        );

        // Write design data
        await fs.writeFile(
            path.join(dataDir, 'design.json'),
            JSON.stringify(data.design, null, 2)
        );

        console.log('✨ Data generated successfully!');
    } catch (error) {
        console.error('Error generating data:', error);
        process.exit(1);
    }
}

main();