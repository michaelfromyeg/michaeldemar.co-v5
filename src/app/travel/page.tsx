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
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
  <Card className="group hover:bg-muted/50 h-full overflow-hidden pt-0 transition-colors">
    {itinerary.coverImage ? (
      <div className="relative h-48 w-full">
        <Image
          src={itinerary.coverImage}
          alt={`Cover image for ${itinerary.title}`}
          fill
          placeholder="blur"
          blurDataURL={itinerary.blurDataURL ?? ''}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    ) : (
      <div className="bg-muted flex h-48 w-full items-center justify-center">
        <ImageIcon className="text-muted-foreground h-12 w-12" />
      </div>
    )}

    <div className="flex flex-1 flex-col gap-6">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">
          {itinerary.title}
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-sm">{itinerary.region}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">{formatDate(itinerary.startDate)}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm">
                {new Date(itinerary.endDate).getDate() -
                  new Date(itinerary.startDate).getDate() +
                  1}{' '}
                days
              </span>
            </div>
          </div>
          {itinerary.description && (
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
              {itinerary.description}
            </p>
          )}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto">
        <div className="text-primary flex items-center text-sm">
          View itinerary
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
      </CardFooter>
    </div>
  </Card>
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedItineraries.map((itinerary) => (
          <Link key={itinerary.id} href={`/travel/${itinerary.slug}`}>
            <TripCard itinerary={itinerary} />
          </Link>
        ))}
      </div>
    </div>
  )
}
