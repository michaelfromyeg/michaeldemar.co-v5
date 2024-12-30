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
  // Sort itineraries by start date, most recent first
  const sortedItineraries = [...travelData.itineraries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  // Separate upcoming and past trips
  const now = new Date()
  const upcomingTrips = sortedItineraries.filter(
    (trip) => new Date(trip.startDate) > now
  )
  const pastTrips = sortedItineraries.filter(
    (trip) => new Date(trip.startDate) <= now
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
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
          <div className="grid gap-6">
            {upcomingTrips.map((itinerary) => (
              <Card
                key={itinerary.id}
                className="group overflow-hidden border-primary/20 transition-colors hover:bg-muted/50"
              >
                {/* Cover Image Section */}
                {itinerary.coverImage ? (
                  <div className="relative h-64 w-full">
                    <Image
                      src={itinerary.coverImage}
                      alt={`Cover image for ${itinerary.title}`}
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
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {itinerary.title}
                      </CardTitle>
                      <CardDescription>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {itinerary.region}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(itinerary.startDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {itinerary.duration} days
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Upcoming
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {itinerary.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-6">
        {pastTrips.map((itinerary) => (
          <Link key={itinerary.id} href={`/travel/${itinerary.slug}`}>
            <Card className="group overflow-hidden transition-colors hover:bg-muted/50">
              {/* Cover Image Section */}
              {itinerary.coverImage ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={itinerary.coverImage}
                    alt={`Cover image for ${itinerary.title}`}
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
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {itinerary.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {itinerary.region}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(itinerary.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {itinerary.duration} days
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  {itinerary.isDone && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      Completed
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{itinerary.description}</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-sm text-primary">
                  View itinerary
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
