import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { PostContent } from '@/components/mdx/post-content'
import travelData from '@/data/travel.json'
import type { TravelItinerary } from '@/lib/notion/types'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return travelData.itineraries.map((itinerary) => ({
    slug: itinerary.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = (await params).slug
  const itinerary = travelData.itinerariesBySlug[
    slug as keyof typeof travelData.itinerariesBySlug
  ] as TravelItinerary | undefined

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

export default async function TravelItineraryPage({ params }: PageProps) {
  const slug = (await params).slug
  const itinerary = travelData.itinerariesBySlug[
    slug as keyof typeof travelData.itinerariesBySlug
  ] as TravelItinerary | undefined

  if (!itinerary) {
    notFound()
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/travel"
        className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center text-sm"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to travel
      </Link>

      <header className="mb-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          {itinerary.title}
        </h1>

        <div className="text-muted-foreground flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {itinerary.region}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(itinerary.startDate)}
            {' - '}
            {formatDate(itinerary.endDate)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {new Date(itinerary.endDate).getDate() -
              new Date(itinerary.startDate).getDate() +
              1}{' '}
            days
          </div>
        </div>

        {itinerary.description && (
          <p className="text-muted-foreground mt-4 text-lg">
            {itinerary.description}
          </p>
        )}
      </header>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <PostContent source={itinerary.content ?? ''} />
      </div>
    </article>
  )
}
