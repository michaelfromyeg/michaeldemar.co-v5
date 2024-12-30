import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChevronRight, Calendar, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import designData from '@/data/design.json'

export const metadata: Metadata = {
  title: 'Design | Michael DeMarco',
  description: 'My design portfolio and case studies.',
}

export default function DesignPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design Portfolio</h1>
        <p className="text-lg text-muted-foreground">
          A collection of my design work, case studies, and experiments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {designData.projects.map((project) => (
          <Link key={project.id} href={`/design/${project.slug}`}>
            <Card className="group h-full overflow-hidden transition-colors hover:bg-muted/50">
              {/* Image Section */}
              {project.coverImage || project.images[0] ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={project.coverImage || project.images[0].url}
                    alt={
                      project.coverImage
                        ? `Cover image for ${project.title}`
                        : project.images[0].alt || project.title
                    }
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <div className="flex h-[calc(100%-12rem)] flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {project.title}
                  </CardTitle>
                  <CardDescription>
                    <div className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.publishedDate
                        ? formatDate(project.publishedDate)
                        : formatDate(project.createdDate)}
                    </div>
                    {project.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto">
                  <div className="flex items-center text-sm text-primary">
                    View project
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
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
    </div>
  )
}
