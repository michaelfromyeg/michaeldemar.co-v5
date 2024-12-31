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
import designData from '@/data/design.json'

const PROJECTS_PER_PAGE = 6

export const metadata: Metadata = {
  title: 'Design | Michael DeMarco',
  description: 'My design portfolio and case studies.',
}

export default async function DesignPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const page = (await searchParams).page
  const currentPage = Number(page) || 1

  // Get latest project and remaining projects
  const [latestProject, ...remainingProjects] = designData.projects
  const totalPages = Math.ceil(remainingProjects.length / PROJECTS_PER_PAGE)

  const paginatedProjects = remainingProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design Portfolio</h1>
        <p className="text-lg text-muted-foreground">
          A collection of my design work, case studies, and experiments.
        </p>
      </div>

      {/* Featured Project */}
      {latestProject && (
        <Link href={`/design/${latestProject.slug}`}>
          <Card className="group mb-12 overflow-hidden transition-colors hover:bg-muted/50">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative h-64 md:h-full">
                {latestProject.coverImage || latestProject.images[0] ? (
                  <Image
                    src={
                      latestProject.coverImage || latestProject.images[0].url
                    }
                    alt={
                      latestProject.coverImage
                        ? `Cover image for ${latestProject.title}`
                        : latestProject.images[0].alt || latestProject.title
                    }
                    fill
                    placeholder="blur"
                    blurDataURL={latestProject.blurDataURL ?? ''}
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
                    Latest Project
                  </span>
                </div>
                <h2 className="mb-4 text-2xl font-bold tracking-tight">
                  {latestProject.title}
                </h2>
                <div className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {latestProject.publishedDate
                    ? formatDate(latestProject.publishedDate)
                    : formatDate(latestProject.createdDate)}
                </div>
                <p className="mb-6 flex-1 text-muted-foreground">
                  {latestProject.description}
                </p>
                <div className="mt-auto">
                  <div className="flex items-center text-primary">
                    View project
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedProjects.map((project) => (
          <Link key={project.id} href={`/design/${project.slug}`}>
            <Card className="group h-full overflow-hidden transition-colors hover:bg-muted/50">
              <div className="relative h-48 w-full">
                {project.coverImage || project.images[0] ? (
                  <Image
                    src={project.coverImage || project.images[0].url}
                    alt={
                      project.coverImage
                        ? `Cover image for ${project.title}`
                        : project.images[0].alt || project.title
                    }
                    fill
                    placeholder="blur"
                    blurDataURL={project.blurDataURL ?? ''}
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
                    {project.title}
                  </CardTitle>
                  <CardDescription>
                    <div className="mb-2 inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.publishedDate
                        ? formatDate(project.publishedDate)
                        : formatDate(project.createdDate)}
                    </div>
                    {project.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto justify-end">
                  <div className="flex items-center text-sm text-primary">
                    View project
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardFooter>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {designData.projects.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">No design projects found.</p>
          </CardContent>
        </Card>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/design"
        className="mt-8"
      />
    </div>
  )
}
