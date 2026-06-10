import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { TagList } from '@/components/content/content-card'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { PostContent } from '@/components/mdx/post-content'
import blogData from '@/data/blog.json'
import type { BlogPost } from '@/lib/notion/types'
import Comments from '@/components/comments'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return blogData.posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = (await params).slug
  const post = blogData.postsBySlug[
    slug as keyof typeof blogData.postsBySlug
  ] as BlogPost | undefined

  if (!post) {
    return {
      title: 'Post Not Found | Michael DeMarco',
    }
  }

  return {
    title: `${post.title} | Michael DeMarco`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const slug = (await params).slug
  const post = blogData.postsBySlug[
    slug as keyof typeof blogData.postsBySlug
  ] as BlogPost | undefined

  if (!post) {
    notFound()
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center text-sm"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to blog
      </Link>
      <header className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="text-muted-foreground flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedDate)}
          </div>
          <TagList tags={post.tags} />
        </div>
      </header>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <PostContent source={post.content ?? ''} />
      </div>
      <Comments slug={slug} title={post.title} />
    </article>
  )
}
