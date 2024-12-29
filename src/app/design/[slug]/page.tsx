import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, Calendar, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import designData from '@/data/design.json'
import { ImageGallery } from '@/components/image-gallery'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return designData.projects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const project: any = await new Promise((resolve) => {
    resolve(
      designData.projectsBySlug[
        params.slug as keyof typeof designData.projectsBySlug
      ]
    )
  })

  if (!project) {
    return {
      title: 'Project Not Found | Michael DeMarco',
      description: 'The requested design project could not be found.',
    }
  }

  return {
    title: `${project.title} | Design | Michael DeMarco`,
    description:
      project.description || `Design case study for ${project.title}`,
  }
}

export default async function DesignProjectPage({ params }: PageProps) {
  const project: any = await new Promise((resolve) => {
    resolve(
      designData.projectsBySlug[
        params.slug as keyof typeof designData.projectsBySlug
      ]
    )
  })

  if (!project) {
    notFound()
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/design"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to portfolio
      </Link>

      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          {project.title}
        </h1>
        {project.description && (
          <p className="mb-4 text-lg text-muted-foreground">
            {project.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-muted-foreground">
          {project.publishedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(project.publishedDate)}
            </div>
          )}
          {project.editedDate && project.editedDate !== project.createdDate && (
            <div className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Updated {formatDate(project.editedDate)}
            </div>
          )}
        </div>
      </header>

      {project.content && (
        <div className="prose prose-gray mb-12 max-w-none dark:prose-invert">
          <MDXRemote
            source={project.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkBreaks],
                rehypePlugins: [rehypePrism, rehypeRaw],
              },
            }}
          />
        </div>
      )}

      {project.images.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Gallery</h2>
          <ImageGallery images={project.images} />
        </div>
      )}
    </article>
  )
}
