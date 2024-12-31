'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Card, CardContent } from '@/components/ui/card'
import { TravelItinerary } from '@/lib/notion/types'
import { formatDate } from '@/lib/utils'

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
  const globeRef = useRef<any>(null)
  const { theme } = useTheme()
  const [activePoint, setActivePoint] = useState<GlobePoint | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [pathIndex, setPathIndex] = useState(0)

  // Assuming we're working with the first itinerary only
  const itinerary = itineraries[0]

  // Sort waypoints by date
  const sortedWaypoints = useMemo(() => {
    return [...itinerary.waypoints].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [itinerary])

  // Create points for markers
  const points = useMemo(() => {
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

  // Handle window resize
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth > 1200 ? 1000 : window.innerWidth - 100,
        height: window.innerWidth > 1200 ? 600 : 400,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-rotate and initial position
  useEffect(() => {
    if (globeRef.current && points.length > 0) {
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
  }, [points])

  return (
    <div className="relative">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
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
        onPointClick={(point: any) => setActivePoint(point)}
      />
      {activePoint && (
        <Card className="absolute right-4 top-4 w-72">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">{activePoint.name}</h3>
            <p className="mb-1 text-sm text-muted-foreground">
              Part of: {activePoint.itineraryTitle}
            </p>
            <p className="mb-1 text-sm text-muted-foreground">
              Region: {activePoint.region}
            </p>
            <p className="text-sm text-muted-foreground">
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
  )
}
