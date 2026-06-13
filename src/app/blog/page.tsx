import { Metadata } from 'next'
import { FeaturedCard } from '@/components/content/content-card'
import { Pagination } from '@/components/pagination'
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
      <FeaturedCard
        href={`/blog/${latestPost.slug}`}
        label="Latest Post"
        title={latestPost.title}
        date={latestPost.publishedDate}
        description={latestPost.description}
        coverImage={latestPost.coverImage}
        coverBlurDataURL={latestPost.blurDataURL}
        ctaLabel="Read post"
      />

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
