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
      <div className="grid gap-8">
        {designData.projects.map((project) => (
          <Link key={project.id} href={`/design/${project.slug}`}>
            <Card className="group overflow-hidden transition-colors hover:bg-muted/50">
              {/* Image Section - Use cover image first, fall back to first project image, then placeholder */}
              {project.coverImage || project.images[0] ? (
                <div className="relative h-64 w-full">
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
                <div className="flex h-64 w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <CardDescription>
                  <div className="mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {project.publishedDate
                      ? formatDate(project.publishedDate)
                      : formatDate(project.createdDate)}
                  </div>
                  {project.description && (
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <span className="mr-2 text-primary">View project</span>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
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
