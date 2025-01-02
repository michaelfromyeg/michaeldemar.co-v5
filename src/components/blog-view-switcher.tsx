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

interface FeedViewProps {
  posts: Post[]
}

const FeedView = ({ posts }: FeedViewProps) => {
  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <article className="group rounded-lg px-4 py-8 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-6">
              {post.coverImage && (
                <div className="relative hidden h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                  <Image
                    src={post.coverImage}
                    alt={`Cover image for ${post.title}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholder="blur"
                    blurDataURL={post.blurDataURL ?? ''}
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight group-hover:text-primary">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {formatDate(post.publishedDate)}
                  </div>
                </div>
                <p className="line-clamp-2 text-muted-foreground">
                  {post.description}
                </p>
                <div className="flex items-center text-sm font-medium text-primary">
                  Read post
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
              <Card className="group h-full overflow-hidden transition-colors hover:bg-muted/50">
                <div className="relative h-48 w-full">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={`Cover image for ${post.title}`}
                      fill
                      placeholder="blur"
                      blurDataURL={post.blurDataURL ?? ''}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex h-[calc(100%-12rem)] flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">
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
                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
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
                      <ChevronRight className="ml-1 h-4 w-4" />
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
