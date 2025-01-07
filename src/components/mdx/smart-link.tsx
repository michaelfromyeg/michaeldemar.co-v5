'use client'

import React from 'react'
import Link from 'next/link'
import { ExternalLink, FileText, FileCode, File } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SmartLinkProps {
  href: string
  children: React.ReactNode
  inline?: boolean
}

const parseYouTubeId = (url: string): string | null => {
  const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[1].length === 11 ? match[1] : null
}

const isExternalLink = (href: string): boolean => {
  return href.startsWith('http') || href.startsWith('//')
}

const getFileType = (href: string): { type: string; icon: typeof File } => {
  const extension = href.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'md':
    case 'mdx':
    case 'txt':
      return { type: 'Document', icon: FileText }
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'go':
    case 'rs':
    case 'java':
    case 'cpp':
    case 'c':
    case 'html':
    case 'css':
      return { type: 'Code', icon: FileCode }
    case 'pdf':
      return { type: 'PDF', icon: File }
    default:
      return { type: 'File', icon: File }
  }
}

const isFileLink = (href: string): boolean => {
  const fileExtensions = [
    'md',
    'mdx',
    'txt',
    'js',
    'jsx',
    'ts',
    'tsx',
    'py',
    'go',
    'rs',
    'java',
    'cpp',
    'c',
    'html',
    'css',
    'pdf',
  ]
  const extension = href.split('.').pop()?.toLowerCase()
  return extension ? fileExtensions.includes(extension) : false
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

const SmartLink = ({ href, children, inline = false }: SmartLinkProps) => {
  // Handle YouTube embeds for non-inline links
  if (!inline) {
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

  // Handle file links
  if (isFileLink(href)) {
    const { type, icon: FileIcon } = getFileType(href)
    const fileName = href.split('/').pop()

    return (
      <Card className={cn('not-prose group', !inline && 'my-4')}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:bg-muted/50"
        >
          <FileIcon className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium text-primary group-hover:text-primary/80">
              {children || fileName}
            </span>
            <span className="text-sm text-muted-foreground">{type}</span>
          </div>
        </a>
      </Card>
    )
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
