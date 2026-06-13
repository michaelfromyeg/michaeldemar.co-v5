'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Check, ChevronsUpDown, RotateCcw } from 'lucide-react'
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

// Camera altitude (in globe radii) the globe rests at; auto-rotation only
// runs at this zoom, and the reset button returns here.
const DEFAULT_ALTITUDE = 1.5

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
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [zoomed, setZoomed] = useState(false)
  // Mirrors `zoomed` for the controls listener so it can detect transitions
  // without re-subscribing on every state change.
  const zoomedRef = useRef(false)
  // Ignore the camera until the opening fly-to settles at DEFAULT_ALTITUDE,
  // so the initial zoom-in doesn't flash the reset button.
  const settledRef = useRef(false)

  // Mount the globe only once WebGL support is confirmed; three.js
  // throws (and takes the whole page down) on WebGL-less browsers
  useEffect(() => {
    const canvas = document.createElement('canvas')
    setWebglSupported(
      Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  }, [])

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

  // Animation control. Keyed on the trip id as well so switching trips
  // restarts the interval from a clean phase — otherwise a switch to a
  // same-length trip leaves the old timer running and the pathIndex reset
  // in selectItinerary is overwritten on the next tick.
  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex((prev) => {
        if (prev >= paths.length - 1) return 0
        return prev + 1
      })
    }, 3000) // Change path every 3 seconds

    return () => clearInterval(interval)
  }, [paths.length, itinerary?.id])

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

  // Spin the globe, but only while it sits at the default zoom. The moment the
  // user zooms in or out, auto-rotation stops and a reset control appears;
  // returning to the default altitude (manually or via reset) resumes it.
  useEffect(() => {
    const globe = globeRef.current
    if (!globeReady || !globe) return

    const controls = globe.controls()
    controls.autoRotateSpeed = 0.3
    controls.autoRotate = true

    const handleChange = () => {
      const atDefault =
        Math.abs(globe.pointOfView().altitude - DEFAULT_ALTITUDE) < 0.05
      // Wait for the opening fly-to to land before tracking zoom.
      if (!settledRef.current) {
        if (atDefault) settledRef.current = true
        return
      }
      controls.autoRotate = atDefault
      if (zoomedRef.current === atDefault) {
        zoomedRef.current = !atDefault
        setZoomed(!atDefault)
      }
    }

    controls.addEventListener('change', handleChange)
    return () => controls.removeEventListener('change', handleChange)
  }, [globeReady])

  // Fly to the selected trip's first waypoint at the default zoom
  useEffect(() => {
    if (globeReady && globeRef.current && points.length > 0) {
      globeRef.current.pointOfView(
        {
          lat: points[0].lat,
          lng: points[0].lng,
          altitude: DEFAULT_ALTITUDE,
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

  // Restore the default zoom without changing the current orientation; the
  // controls listener picks up the altitude change and resumes auto-rotation.
  function resetView() {
    const globe = globeRef.current
    if (!globe) return
    const { lat, lng } = globe.pointOfView()
    globe.pointOfView({ lat, lng, altitude: DEFAULT_ALTITUDE }, 750)
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

  if (webglSupported === false) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">
          This browser can&apos;t render the 3D globe (WebGL unavailable).
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-haspopup="listbox"
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
                      value={`${trip.title} ${trip.region} ${trip.id}`}
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
        {webglSupported === null ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-muted-foreground">Loading globe...</div>
          </div>
        ) : (
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
            pathsData={paths.slice(0, pathIndex + 1)}
            pathPoints="points"
            pathColor={() => (theme === 'dark' ? '#3B82F6' : '#2563EB')}
            pathDashLength={0.1}
            pathDashGap={0.05}
            pathDashAnimateTime={3000}
            pathStroke={2}
            onPointClick={(point: object) =>
              setActivePoint(point as GlobePoint)
            }
          />
        )}
        {zoomed && (
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            className="absolute top-4 left-4 gap-1.5 shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Reset view
          </Button>
        )}
        {activePoint && (
          <Card className="absolute top-4 right-4 w-72 py-0">
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
