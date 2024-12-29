import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import travelData from '@/data/travel.json'

import './travel.css'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return travelData.itineraries.map((itinerary) => ({
    slug: itinerary.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const itinerary: any = await new Promise((resolve) => {
    resolve(
      travelData.itinerariesBySlug[
        params.slug as keyof typeof travelData.itinerariesBySlug
      ]
    )
  })

  if (!itinerary) {
    return {
      title: 'Itinerary Not Found | Michael DeMarco',
    }
  }

  return {
    title: `${itinerary.title} | Travel | Michael DeMarco`,
    description: itinerary.description,
  }
}

export default async function TravelPage({ params }: PageProps) {
  const itinerary: any = await new Promise((resolve) => {
    resolve(
      travelData.itinerariesBySlug[
        params.slug as keyof typeof travelData.itinerariesBySlug
      ]
    )
  })

  if (!itinerary) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      <div className="border-b bg-muted/50">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Link
            href="/travel"
            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to travel
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {itinerary.region}
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              {itinerary.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(itinerary.startDate)}
                {' - '}
                {formatDate(itinerary.endDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {itinerary.duration} days
              </div>
            </div>
            <p className="max-w-2xl text-lg">{itinerary.description}</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Quick Facts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">
                Duration
              </div>
              <div>{itinerary.duration} days</div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">
                Region
              </div>
              <div>{itinerary.region}</div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">
                Status
              </div>
              <div>{itinerary.isDone ? 'Completed' : 'Planned'}</div>
            </div>
          </CardContent>
        </Card>
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <MDXRemote
            source={itinerary.content ?? ''}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkBreaks],
                rehypePlugins: [rehypePrism, rehypeRaw],
              },
            }}
          />
        </div>
      </div>
    </article>
  )
}
