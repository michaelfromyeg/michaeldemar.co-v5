import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import remarkBreaks from 'remark-breaks'
import blogData from '@/data/blog.json'
import Comments from '@/components/comments'

import '@/lib/prism'
import '@/styles/prism.css'

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
  const post: any =
    blogData.postsBySlug[slug as keyof typeof blogData.postsBySlug]

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
  const post: any =
    blogData.postsBySlug[slug as keyof typeof blogData.postsBySlug]

  if (!post) {
    notFound()
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to blog
      </Link>
      <header className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedDate)}
          </div>
          <div className="flex gap-2">
            {post.tags.map((tag: any) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <MDXRemote
          source={post.content ?? ''}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkBreaks],
              rehypePlugins: [
                [
                  rehypePrism,
                  {
                    ignoreMissing: true, // Don't throw on missing language
                    aliases: {
                      // Add common aliases
                      js: 'javascript',
                      py: 'python',
                      sh: 'bash',
                      ts: 'typescript',
                    },
                  },
                ],
              ],
            },
          }}
        />
      </div>
      <Comments slug={slug} title={post.title} />
    </article>
  )
}
