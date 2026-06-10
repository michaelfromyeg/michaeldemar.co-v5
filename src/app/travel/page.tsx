import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { CardGrid, ContentCard } from '@/components/content/content-card'
import { Clock, MapPin } from 'lucide-react'
import travelData from '@/data/travel.json'
import TravelGlobe from '@/components/globe'
import type { TravelItinerary } from '@/lib/notion/types'

export const metadata: Metadata = {
  title: 'Travel | Michael DeMarco',
  description: 'Travel adventures and itineraries from around the world.',
}

interface TripCardProps {
  itinerary: TravelItinerary
}

const TripCard = ({ itinerary }: TripCardProps) => (
  <ContentCard
    href={`/travel/${itinerary.slug}`}
    title={itinerary.title}
    date={itinerary.startDate}
    description={itinerary.description}
    coverImage={itinerary.coverImage}
    coverBlurDataURL={itinerary.blurDataURL}
    ctaLabel="View itinerary"
    meta={
      <>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {itinerary.region}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {new Date(itinerary.endDate).getDate() -
            new Date(itinerary.startDate).getDate() +
            1}{' '}
          days
        </div>
      </>
    }
  />
)

export default function TravelPage() {
  // Sort itineraries by start date, newest first
  const sortedItineraries = [...travelData.itineraries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Travel</h1>
        <p className="text-muted-foreground text-lg">
          Adventures and detailed itineraries from around the world.
        </p>
      </div>

      <Card className="mb-12 py-0">
        <CardContent className="p-8">
          <div className="flex w-full justify-center">
            <TravelGlobe itineraries={travelData.itineraries} />
          </div>
        </CardContent>
      </Card>

      <CardGrid>
        {sortedItineraries.map((itinerary) => (
          <TripCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </CardGrid>
    </div>
  )
}
