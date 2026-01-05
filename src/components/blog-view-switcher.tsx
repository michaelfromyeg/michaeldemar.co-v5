'use client'

import React from 'react'
import { formatDate } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar, ChevronRight, Image as ImageIcon } from 'lucide-react'
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
          <article className="group rounded-lg border border-border/50 p-6 transition-all duration-300 hover:border-accent hover:bg-muted/50">
            <div className="flex items-start gap-6">
              {post.coverImage && (
                <div className="relative hidden h-44 w-64 flex-shrink-0 overflow-hidden rounded-lg sm:block">
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
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-transform duration-200 hover:scale-105"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {formatDate(post.publishedDate)}
                  </div>
                </div>
                <p className="line-clamp-5 text-muted-foreground">
                  {getContentPreview(post.content)}
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="card-glow group h-full overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 w-full overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={`Cover image for ${post.title}`}
                      fill
                      placeholder="blur"
                      blurDataURL={post.blurDataURL ?? ''}
                      className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex h-[calc(100%-12rem)] flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg transition-colors duration-200 group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        {formatDate(post.publishedDate)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-transform duration-200 hover:scale-105"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <div className="flex items-center text-sm text-primary">
                      Read more
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </CardFooter>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default BlogViewSwitcher
