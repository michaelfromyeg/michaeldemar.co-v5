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

const parseVimeoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

const isTweetUrl = (url: string): boolean => {
  try {
    const { hostname, pathname } = new URL(url)
    return (
      /^(www\.)?(x|twitter)\.com$/.test(hostname) &&
      /^\/[^/]+\/status\/\d+/.test(pathname)
    )
  } catch {
    return false
  }
}

const isVideoFile = (href: string): boolean => {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(href)
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
    <Card className={cn('not-prose my-4 overflow-hidden', className)}>
      <div className="relative h-0 pb-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          className="absolute top-0 left-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  )
}

const VimeoEmbed = ({ videoId }: { videoId: string }) => {
  return (
    <Card className="not-prose my-4 overflow-hidden">
      <div className="relative h-0 pb-[56.25%]">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title="Vimeo video player"
          className="absolute top-0 left-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
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
              className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 text-sm"
            >
              Watch on YouTube
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )
    }

    const vimeoId = href.includes('vimeo.com') ? parseVimeoId(href) : null
    if (vimeoId) {
      return (
        <>
          <VimeoEmbed videoId={vimeoId} />
          <div className="mt-2 text-center">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 text-sm"
            >
              Watch on Vimeo
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )
    }

    if (isVideoFile(href)) {
      return (
        <Card className="not-prose my-4 overflow-hidden">
          <video
            controls
            src={href}
            aria-label={typeof children === 'string' ? children : 'Video'}
            className="w-full"
          />
        </Card>
      )
    }

    if (isTweetUrl(href)) {
      const domain = new URL(href).hostname.replace(/^www\./, '')
      const label =
        typeof children === 'string' && children.startsWith('http')
          ? `Post on ${domain}`
          : children
      return (
        <Card className="not-prose group my-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-muted/50 flex items-center gap-3 p-3"
          >
            <ExternalLink className="text-muted-foreground h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-primary group-hover:text-primary/80 font-medium">
                {label}
              </span>
              <span className="text-muted-foreground text-sm">{domain}</span>
            </div>
          </a>
        </Card>
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
          className="hover:bg-muted/50 flex items-center gap-3 p-3"
        >
          <FileIcon className="text-muted-foreground h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-primary group-hover:text-primary/80 font-medium">
              {children || fileName}
            </span>
            <span className="text-muted-foreground text-sm">{type}</span>
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
          'text-primary hover:text-primary/80 inline-flex items-center gap-1',
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
