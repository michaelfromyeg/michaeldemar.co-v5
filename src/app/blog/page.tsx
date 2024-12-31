import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronRight, Calendar, Image as ImageIcon } from 'lucide-react'
import { Pagination } from '@/components/pagination'
import Link from 'next/link'
import Image from 'next/image'
import blogData from '@/data/blog.json'

const POSTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Blog | Michael DeMarco',
  description: 'Thoughts on software development, design, and life.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const page = (await searchParams).page
  const currentPage = Number(page) || 1

  // Get latest post and remaining posts
  const [latestPost, ...remainingPosts] = blogData.posts
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE)

  const paginatedPosts = remainingPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          My thoughts on software development, design, and life.
        </p>
      </div>

      {/* Featured Post */}
      <Link href={`/blog/${latestPost.slug}`}>
        <Card className="group mb-12 overflow-hidden transition-colors hover:bg-muted/50">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative h-64 md:h-full">
              {latestPost.coverImage ? (
                <Image
                  src={latestPost.coverImage}
                  alt={`Cover image for ${latestPost.title}`}
                  fill
                  placeholder="blur"
                  blurDataURL={latestPost.blurDataURL ?? ''}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col p-6">
              <div className="mb-4">
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Latest Post
                </span>
              </div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                {latestPost.title}
              </h2>
              <div className="mb-4 flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1.5 h-4 w-4" />
                {formatDate(latestPost.publishedDate)}
              </div>
              <p className="mb-6 flex-1 text-muted-foreground">
                {latestPost.description}
              </p>
              <div className="mt-auto">
                <div className="flex items-center text-primary">
                  Read post
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Recent Posts Grid */}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/blog"
        className="mt-8"
      />
    </div>
  )
}
