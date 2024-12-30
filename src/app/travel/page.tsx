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

export const metadata: Metadata = {
  title: 'Travel | Michael DeMarco',
  description: 'Travel adventures and itineraries from around the world.',
}

export default function TravelPage() {
  const now = new Date()
  const sortedItineraries = [...travelData.itineraries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  const upcomingTrips = sortedItineraries.filter(
    (trip) => new Date(trip.startDate) > now
  )
  const pastTrips = sortedItineraries.filter(
    (trip) => new Date(trip.startDate) <= now
  )

  const TripCard = ({ itinerary, isUpcoming = false }: any) => (
    <Card className="group h-full overflow-hidden transition-colors hover:bg-muted/50">
      {itinerary.coverImage ? (
        <div className="relative h-48 w-full">
          <Image
            src={itinerary.coverImage}
            alt={`Cover image for ${itinerary.title}`}
            fill
            placeholder="blur"
            blurDataURL={itinerary.blurDataURL}
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
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">
              {itinerary.title}
            </CardTitle>
            <span
              className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium ${
                isUpcoming ? 'bg-primary/10 text-primary' : 'bg-muted'
              }`}
            >
              {isUpcoming ? 'Upcoming' : 'Completed'}
            </span>
          </div>
          <CardDescription>
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-sm">{itinerary.region}</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-sm">
                  {formatDate(itinerary.startDate)}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-sm">{itinerary.duration} days</span>
              </div>
            </div>
            {itinerary.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {itinerary.description}
              </p>
            )}
          </CardDescription>
        </CardHeader>

        <CardFooter className="mt-auto">
          <div className="flex items-center text-sm text-primary">
            {isUpcoming ? 'Coming soon' : 'View itinerary'}
            <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </CardFooter>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Travel</h1>
        <p className="text-lg text-muted-foreground">
          Adventures and detailed itineraries from around the world.
        </p>
      </div>

      <Card className="mb-12">
        <CardContent className="p-8">
          <div className="flex w-full justify-center">
            <TravelGlobe itineraries={travelData.itineraries} />
          </div>
        </CardContent>
      </Card>

      {upcomingTrips.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Upcoming Adventures
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.map((itinerary) => (
              <div key={itinerary.id}>
                <TripCard itinerary={itinerary} isUpcoming={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pastTrips.map((itinerary) => (
          <Link key={itinerary.id} href={`/travel/${itinerary.slug}`}>
            <TripCard itinerary={itinerary} />
          </Link>
        ))}
      </div>
    </div>
  )
}
