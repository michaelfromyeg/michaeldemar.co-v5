'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'

interface CommentsProps {
  slug: string
  title: string
}

export function Comments({ slug }: CommentsProps) {
  const { theme } = useTheme()
  const commentsRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!commentsRef.current) return

    console.log('Loading Giscus for:', `blog/${slug}`)

    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="giscus"]')
    if (existingScript) existingScript.remove()

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'

    // Required parameters
    script.setAttribute('data-repo', process.env.NEXT_PUBLIC_GISCUS_REPO!)
    script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPO_ID!)
    script.setAttribute('data-category', 'Announcements')
    script.setAttribute(
      'data-category-id',
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!
    )

    // Optional parameters
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', `blog/${slug}`)
    script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')

    script.crossOrigin = 'anonymous'
    script.async = true

    commentsRef.current.appendChild(script)
  }, [slug, theme])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={commentsRef} className="giscus" />
      </CardContent>
    </Card>
  )
}

export default Comments
