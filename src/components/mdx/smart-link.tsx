'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SmartLinkProps {
  href: string
  children: React.ReactNode
}

const parseYouTubeId = (url: string): string | null => {
  const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[1].length === 11 ? match[1] : null
}

const isExternalLink = (href: string): boolean => {
  return href.startsWith('http') || href.startsWith('//')
}

interface YouTubeEmbedProps {
  videoId: string
  className?: string
}

const YouTubeEmbed = ({ videoId, className }: YouTubeEmbedProps) => {
  return (
    <Card className={cn('my-4 overflow-hidden', className)}>
      <div className="relative h-0 pb-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="absolute left-0 top-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  )
}

interface SmartLinkProps {
  href: string
  children: React.ReactNode
  inline?: boolean // New prop to handle inline vs block rendering
}

const SmartLink = ({ href, children, inline = false }: SmartLinkProps) => {
  // Only try to embed YouTube videos for non-inline links
  if (!inline) {
    console.log('!inline', href, parseYouTubeId(href))
    const youtubeId = parseYouTubeId(href)
    if (youtubeId) {
      return (
        <>
          <YouTubeEmbed videoId={youtubeId} />
          <div className="mt-2 text-center">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              Watch on YouTube
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )
    }
  }

  // Handle external links
  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1 text-primary hover:text-primary/80',
          !inline && 'my-4 block'
        )}
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </a>
    )
  }

  // Internal links
  return (
    <Link
      href={href}
      className={cn(
        'text-primary hover:text-primary/80',
        !inline && 'my-4 block'
      )}
    >
      {children}
    </Link>
  )
}

export default SmartLink
