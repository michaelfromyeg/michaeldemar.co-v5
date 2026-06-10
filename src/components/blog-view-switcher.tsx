'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'
import {
  CardGrid,
  ContentCard,
  TagList,
} from '@/components/content/content-card'
import { Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Post } from '@/types/blog'

// Strip markdown formatting to get plain text preview
function getContentPreview(content: string, maxLength: number = 500): string {
  return (
    content
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove extra whitespace
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength) + (content.length > maxLength ? '...' : '')
  )
}

interface FeedViewProps {
  posts: Post[]
}

const FeedView = ({ posts }: FeedViewProps) => {
  return (
    <div className="space-y-10">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="block">
          <article className="group border-border/50 hover:border-accent hover:bg-muted/50 rounded-lg border p-6 transition-all duration-300">
            <div className="flex items-start gap-6">
              {post.coverImage && (
                <div className="relative hidden h-44 w-64 shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image
                    src={post.coverImage}
                    alt={`Cover image for ${post.title}`}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
                    placeholder="blur"
                    blurDataURL={post.blurDataURL ?? ''}
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <TagList tags={post.tags} />
                  <h3 className="group-hover:text-primary text-2xl font-semibold tracking-tight transition-colors duration-200">
                    {post.title}
                  </h3>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {formatDate(post.publishedDate)}
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-5">
                  {getContentPreview(post.content)}
                </p>
                <div className="text-primary flex items-center text-sm font-medium">
                  Read more...
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}

interface BlogViewSwitcherProps {
  latestPost: Post
  paginatedPosts: Post[]
  currentView: string
}

const BlogViewSwitcher = ({
  paginatedPosts,
  currentView,
}: BlogViewSwitcherProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('view', view)
    router.replace(`/blog?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs
      value={currentView}
      onValueChange={handleViewChange}
      className="w-full"
    >
      <TabsList className="mb-8">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="grid">Grid</TabsTrigger>
      </TabsList>
      <TabsContent value="feed">
        <FeedView posts={paginatedPosts} />
      </TabsContent>
      <TabsContent value="grid">
        <CardGrid>
          {paginatedPosts.map((post) => (
            <ContentCard
              key={post.id}
              href={`/blog/${post.slug}`}
              title={post.title}
              date={post.publishedDate}
              description={post.description}
              tags={post.tags}
              coverImage={post.coverImage}
              coverBlurDataURL={post.blurDataURL}
              ctaLabel="Read more"
            />
          ))}
        </CardGrid>
      </TabsContent>
    </Tabs>
  )
}

export default BlogViewSwitcher
