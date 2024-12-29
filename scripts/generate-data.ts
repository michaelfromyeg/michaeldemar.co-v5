import 'dotenv/config'
import { generateBlogData } from '../src/lib/notion/blog'
import { generateDesignData } from '../src/lib/notion/design'
import { generateTravelData } from '../src/lib/notion/travel'
import fs from 'fs/promises'
import path from 'path'

async function main() {
  try {
    console.log('Generating data from Notion...')

    // Generate all data in parallel
    const [blogData, designData, travelData] = await Promise.all([
      generateBlogData(),
      generateDesignData(),
      generateTravelData(),
    ])

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'src/data')
    await fs.mkdir(dataDir, { recursive: true })

    // Write all data files
    await Promise.all([
      fs.writeFile(
        path.join(dataDir, 'blog.json'),
        JSON.stringify(blogData, null, 2)
      ),
      fs.writeFile(
        path.join(dataDir, 'design.json'),
        JSON.stringify(designData, null, 2)
      ),
      fs.writeFile(
        path.join(dataDir, 'travel.json'),
        JSON.stringify(travelData, null, 2)
      ),
    ])

    console.log('✨ All data generated successfully!')
  } catch (error) {
    console.error('Error generating data:', error)
    process.exit(1)
  }
}

main()
