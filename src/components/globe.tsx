'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TravelItinerary } from '@/lib/notion/types'
import { cn, formatDate } from '@/lib/utils'
import type { GlobeMethods } from 'react-globe.gl'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <div className="text-muted-foreground">Loading globe...</div>
    </div>
  ),
})

interface GlobePoint {
  lat: number
  lng: number
  name: string
  date: string
  duration: number
  itineraryTitle: string
  region: string
}

interface PathData {
  points: [number, number][] // Array of [lat, lng] coordinates
  name: string
}

interface TravelGlobeProps {
  itineraries: TravelItinerary[]
}

export default function TravelGlobe({ itineraries }: TravelGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [activePoint, setActivePoint] = useState<GlobePoint | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [pathIndex, setPathIndex] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [globeReady, setGlobeReady] = useState(false)

  // Trips without waypoints can't be drawn; most recent trip first
  const selectableItineraries = useMemo(() => {
    return itineraries
      .filter((itinerary) => itinerary.waypoints.length > 0)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
  }, [itineraries])

  const itinerary =
    selectableItineraries.find((trip) => trip.id === selectedId) ??
    selectableItineraries[0]

  // Sort waypoints by date
  const sortedWaypoints = useMemo(() => {
    if (!itinerary) return []
    return [...itinerary.waypoints].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [itinerary])

  // Create points for markers
  const points = useMemo(() => {
    if (!itinerary) return []
    return sortedWaypoints.map((waypoint) => ({
      lat: waypoint.latitude,
      lng: waypoint.longitude,
      name: waypoint.title,
      date: waypoint.date,
      duration: waypoint.duration,
      itineraryTitle: itinerary.title,
      region: itinerary.region,
    }))
  }, [sortedWaypoints, itinerary])

  // Create paths data structure
  const paths = useMemo(() => {
    const allPaths: PathData[] = []
    for (let i = 0; i < sortedWaypoints.length - 1; i++) {
      allPaths.push({
        points: [
          [sortedWaypoints[i].latitude, sortedWaypoints[i].longitude],
          [sortedWaypoints[i + 1].latitude, sortedWaypoints[i + 1].longitude],
        ],
        name: `${sortedWaypoints[i].title} to ${sortedWaypoints[i + 1].title}`,
      })
    }
    return allPaths
  }, [sortedWaypoints])

  // Animation control
  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex((prev) => {
        if (prev >= paths.length - 1) return 0
        return prev + 1
      })
    }, 3000) // Change path every 3 seconds

    return () => clearInterval(interval)
  }, [paths.length])

  // Size the globe to its container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width)
      if (width === 0) return
      setDimensions({
        width,
        height: Math.max(400, Math.min(600, Math.round(width * 0.6))),
      })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Auto-rotate and fly to the selected trip's first waypoint
  useEffect(() => {
    if (globeReady && globeRef.current && points.length > 0) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.3
      globeRef.current.pointOfView(
        {
          lat: points[0].lat,
          lng: points[0].lng,
          altitude: 1.5,
        },
        1000
      )
    }
  }, [points, globeReady])

  function selectItinerary(id: string) {
    setSelectedId(id)
    setPathIndex(0)
    setActivePoint(null)
    setPickerOpen(false)
  }

  if (!itinerary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">
          No trips with waypoints to show yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={pickerOpen}
              className="w-full justify-between sm:w-80"
            >
              <span className="truncate">
                {itinerary.title} &middot; {formatDate(itinerary.startDate)}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search trips..." />
              <CommandList>
                <CommandEmpty>No trips found.</CommandEmpty>
                <CommandGroup>
                  {selectableItineraries.map((trip) => (
                    <CommandItem
                      key={trip.id}
                      value={`${trip.title} ${trip.region}`}
                      onSelect={() => selectItinerary(trip.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          trip.id === itinerary.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{trip.title}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {trip.region} &middot; {formatDate(trip.startDate)}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div ref={containerRef} className="relative">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={() => setGlobeReady(true)}
          globeImageUrl={
            theme === 'dark'
              ? '//unpkg.com/three-globe/example/img/earth-dark.jpg'
              : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
          }
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={theme === 'dark' ? '#3B82F6' : '#2563EB'}
          atmosphereAltitude={0.1}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => (theme === 'dark' ? '#3B82F6' : '#2563EB')}
          pointAltitude={0}
          pointRadius={0.2}
          pointsMerge={true}
          pathsData={paths.slice(0, pathIndex + 1)}
          pathPoints="points"
          pathColor={() => (theme === 'dark' ? '#3B82F6' : '#2563EB')}
          pathDashLength={0.1}
          pathDashGap={0.05}
          pathDashAnimateTime={3000}
          pathStroke={2}
          onPointClick={(point: object) => setActivePoint(point as GlobePoint)}
        />
        {activePoint && (
          <Card className="absolute top-4 right-4 w-72">
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">{activePoint.name}</h3>
              <p className="text-muted-foreground mb-1 text-sm">
                Part of: {activePoint.itineraryTitle}
              </p>
              <p className="text-muted-foreground mb-1 text-sm">
                Region: {activePoint.region}
              </p>
              <p className="text-muted-foreground text-sm">
                Date: {formatDate(activePoint.date)}
                {activePoint.duration > 0 && (
                  <>
                    <br />
                    Duration: {activePoint.duration} days
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
