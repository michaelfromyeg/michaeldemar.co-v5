import { generateRssFeed } from '@/lib/feed'
import { NextResponse } from 'next/server'

export async function GET() {
  const feed = await generateRssFeed()
  return new NextResponse(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}

// This ensures the feed is statically generated at build time
export const dynamic = 'force-static'
