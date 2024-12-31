# Enhancing Notion Page Cards with Cover Images
`2024-12-31 22:44:41`

_Prompt_:
My blog, design, and travel cards kind-a suck. Each of the related Notion pages has a cover image. Let's use that as the card image.

_Claude_:
I'll help you modify the Notion integration to fetch and use cover images for your blog, design, and travel cards. Let me analyze the current code and make the necessary changes.

First, let's modify the base types and utilities to handle cover images. I'll create a function to handle cover images similar to how we handle other images.

_Prompt_:
how do I update downloadAndSaveImage? export async function downloadAndSaveImage(   imageUrl: string,   category: 'blog' | 'design' | 'travel',   itemId: string,   index: number ): Promise<string> {   try {     const originalFilename = extractS3Filename(imageUrl)     const extension = '.webp' // We'll convert everything to WebP     const basename = path.basename(       originalFilename,       path.extname(originalFilename)     )     const filename = `${index.toString().padStart(3, '0')}-${basename}${extension}`      const imageDir = path.join(       process.cwd(),       'public',       `${category}-images`,       itemId     )     const imagePath = path.join(imageDir, filename)     const publicPath = `/${category}-images/${itemId}/${filename}`      if (await fileExists(imagePath)) {       console.log(`Image already exists: ${publicPath}`)       return publicPath     }      await fs.mkdir(imageDir, { recursive: true })     const response = await fetch(imageUrl)     if (!response.ok)       throw new Error(`Failed to fetch image: ${response.statusText}`)      const buffer = await response.buffer()      // Process with Sharp     await sharp(buffer)       .resize({         width: 1920,         height: 1080,         fit: 'inside', // Maintain aspect ratio         withoutEnlargement: true, // Don't upscale small images       })       .webp({         quality: 80, // Good balance of quality and file size         effort: 6, // Higher compression effort       })       .toFile(imagePath)      console.log(`Processed and saved image: ${publicPath}`)      return publicPath   } catch (error) {     console.error(`Failed to process image ${imageUrl}:`, error)     return imageUrl   } }

_Claude_:
I'll help modify the downloadAndSaveImage function to handle the new prefix parameter. Here's the updated version:

_Prompt_:
Fantastic. Let's do the travel content now.

_Claude_:
I'll update the travel code to handle cover images. First, let's update the travel data fetching code:

_Prompt_:
And finally, let's do the design stuff.

_Claude_:
I'll update the design implementation to handle cover images, similar to how we did for blog and travel.

First, let's update the design data fetching code:

