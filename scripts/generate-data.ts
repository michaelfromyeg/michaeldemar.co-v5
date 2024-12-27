import 'dotenv/config';
import { generateBlogData } from '../src/lib/notion';
import { generateDesignData } from '../src/lib/notion-design';
import fs from 'fs/promises';
import path from 'path';

async function ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'src/data');
    await fs.mkdir(dataDir, { recursive: true });
    return dataDir;
}

async function writeJsonToFile(filePath: string, data: any) {
    await fs.writeFile(
        filePath,
        JSON.stringify(data, null, 2)
    );
}

async function main() {
    console.log('🚀 Starting data generation process...');
    const dataDir = await ensureDataDirectory();
    
    try {
        // Generate blog data
        console.log('\n📝 Generating blog data...');
        const blogData = await generateBlogData();
        await writeJsonToFile(
            path.join(dataDir, 'blog.json'),
            blogData
        );
        console.log('✅ Blog data generated successfully!');
        
        // Generate design data
        console.log('\n🎨 Generating design data...');
        const designData = await generateDesignData();
        await writeJsonToFile(
            path.join(dataDir, 'design.json'),
            designData
        );
        console.log('✅ Design data generated successfully!');
        
        console.log('\n✨ All data generated successfully!');
    } catch (error) {
        console.error('\n❌ Error during data generation:', error);
        process.exit(1);
    }
}

main();