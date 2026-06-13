import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import {
  CardGrid,
  ContentCard,
  FeaturedCard,
} from '@/components/content/content-card'
import { Pagination } from '@/components/pagination'
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
        <p className="text-muted-foreground text-lg">
          A collection of my design work, case studies, and experiments.
        </p>
      </div>

      {/* Featured Project */}
      {latestProject && (
        <FeaturedCard
          href={`/design/${latestProject.slug}`}
          label="Latest Project"
          title={latestProject.title}
          date={latestProject.publishedDate || latestProject.createdDate}
          description={latestProject.description}
          tags={latestProject.tags}
          coverImage={latestProject.coverImage || latestProject.images[0]?.url}
          coverAlt={
            latestProject.coverImage
              ? undefined
              : latestProject.images[0]?.alt || latestProject.title
          }
          coverBlurDataURL={latestProject.blurDataURL}
          ctaLabel="View project"
        />
      )}

      {/* Projects Grid */}
      <CardGrid>
        {paginatedProjects.map((project) => (
          <ContentCard
            key={project.id}
            href={`/design/${project.slug}`}
            title={project.title}
            date={project.publishedDate || project.createdDate}
            description={project.description}
            tags={project.tags}
            coverImage={project.coverImage || project.images[0]?.url}
            coverAlt={
              project.coverImage
                ? undefined
                : project.images[0]?.alt || project.title
            }
            coverBlurDataURL={project.blurDataURL}
            ctaLabel="View project"
          />
        ))}
      </CardGrid>

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
