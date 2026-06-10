import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ChevronRight, Calendar, Image as ImageIcon } from 'lucide-react'
import { Pagination } from '@/components/pagination'
import Link from 'next/link'
import Image from 'next/image'
import blogData from '@/data/blog.json'
import NewsletterForm from '@/components/newsletter-form'
import BlogViewSwitcher from '@/components/blog-view-switcher'
import { Post } from '@/types/blog'

const POSTS_PER_PAGE = 9

export const metadata: Metadata = {
  title: 'Blog | Michael DeMarco',
  description: 'Thoughts on software development, design, and life.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>
}) {
  const params = await searchParams
  const page = params.page
  const currentPage = Number(page) || 1
  const currentView = params.view || 'feed'

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
        <p className="text-muted-foreground text-lg">
          My thoughts on software development, design, and life.
        </p>
      </div>

      {/* Featured Post */}
      <Link href={`/blog/${latestPost.slug}`}>
        <Card className="card-glow group mb-12 overflow-hidden py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative h-64 md:h-full">
              {latestPost.coverImage ? (
                <Image
                  src={latestPost.coverImage}
                  alt={`Cover image for ${latestPost.title}`}
                  fill
                  placeholder="blur"
                  blurDataURL={latestPost.blurDataURL ?? ''}
                  className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <ImageIcon className="text-muted-foreground h-16 w-16" />
                </div>
              )}
            </div>
            <div className="flex flex-col p-6">
              <div className="mb-4">
                <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-sm font-medium">
                  Latest Post
                </span>
              </div>
              <h2 className="group-hover:text-primary mb-4 text-2xl font-bold tracking-tight transition-colors duration-200">
                {latestPost.title}
              </h2>
              <div className="text-muted-foreground mb-4 flex items-center text-sm">
                <Calendar className="mr-1.5 h-4 w-4" />
                {formatDate(latestPost.publishedDate)}
              </div>
              <p className="text-muted-foreground mb-6 flex-1">
                {latestPost.description}
              </p>
              <div className="mt-auto">
                <div className="text-primary flex items-center">
                  Read post
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* View Switcher */}
      <BlogViewSwitcher
        latestPost={latestPost as Post}
        paginatedPosts={paginatedPosts as Post[]}
        currentView={currentView}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/blog`}
        searchParams={{ view: currentView }}
        className="mt-8"
      />

      <div className="my-12 flex justify-center">
        <NewsletterForm
          title="Subscribe to 'Busy Living'"
          description="Get notified when I publish new posts and projects."
        />
      </div>
    </div>
  )
}
