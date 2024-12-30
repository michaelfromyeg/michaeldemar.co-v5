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
import { ChevronRight, Calendar, Edit2, Image as ImageIcon } from 'lucide-react'
import { Pagination } from '@/components/pagination'
import Link from 'next/link'
import Image from 'next/image'
import blogData from '@/data/blog.json'

// Number of posts per page
const POSTS_PER_PAGE = 12

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
  const totalPages = Math.ceil(blogData.posts.length / POSTS_PER_PAGE)

  const paginatedPosts = blogData.posts.slice(
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

      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {paginatedPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="group h-full overflow-hidden transition-colors hover:bg-muted/50">
              {/* Cover Image Section */}
              {post.coverImage ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={post.coverImage}
                    alt={`Cover image for ${post.title}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Make the content area a flex container that fills remaining height */}
              <div className="flex h-[calc(100%-16rem)] flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-xl">
                    {post.title}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.createdDate)}
                      {post.editedDate && (
                        <>
                          <Edit2 className="ml-2 h-4 w-4" />
                          {formatDate(post.editedDate)}
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/blog"
        className="mt-8"
      />
    </div>
  )
}
