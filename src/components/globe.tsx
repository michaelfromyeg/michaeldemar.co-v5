'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Card, CardContent } from '@/components/ui/card'
import { TravelItinerary } from '@/lib/notion/types'
import { formatDate } from '@/lib/utils'
import * as THREE from 'three'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
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
  index: number
}

interface TravelGlobeProps {
  itineraries: TravelItinerary[]
}

// Convert lat/lng to 3D coordinates on sphere
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = 100
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Generate points along great circle path
function generatePathPoints(
  start: GlobePoint,
  end: GlobePoint,
  numPoints: number = 50
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const v1 = latLngToVector3(start.lat, start.lng)
  const v2 = latLngToVector3(end.lat, end.lng)

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const position = new THREE.Vector3()
    position.copy(v1).lerp(v2, t)
    position.normalize().multiplyScalar(100) // Keep on sphere surface
    points.push(position)
  }

  return points
}

export default function TravelGlobe({ itineraries }: TravelGlobeProps) {
  const globeRef = useRef<any>(null)
  const linesRef = useRef<THREE.LineSegments | null>(null)
  const { theme } = useTheme()
  const [activePoint, setActivePoint] = useState<GlobePoint | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [currentSegment, setCurrentSegment] = useState(-1)

  const points = useMemo(() => {
    const allPoints: GlobePoint[] = []

    itineraries.forEach((itinerary) => {
      const sortedWaypoints = [...itinerary.waypoints].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      sortedWaypoints.forEach((waypoint) => {
        allPoints.push({
          lat: waypoint.latitude,
          lng: waypoint.longitude,
          name: waypoint.title,
          date: waypoint.date,
          duration: waypoint.duration,
          itineraryTitle: itinerary.title,
          region: itinerary.region,
          index: allPoints.length,
        })
      })
    })

    return allPoints.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [itineraries])

  // Update lines visualization
  useEffect(() => {
    if (!globeRef.current || currentSegment < 0) return

    // Remove previous lines
    if (linesRef.current) {
      globeRef.current.scene().remove(linesRef.current)
      linesRef.current.geometry.dispose()
      // linesRef.current.material
    }

    // Create new lines up to current segment
    const lineGeometry = new THREE.BufferGeometry()
    const positions: number[] = []

    for (let i = 0; i < currentSegment && i < points.length - 1; i++) {
      const pathPoints = generatePathPoints(points[i], points[i + 1])

      // Create line segments from path points
      for (let j = 0; j < pathPoints.length - 1; j++) {
        positions.push(
          pathPoints[j].x,
          pathPoints[j].y,
          pathPoints[j].z,
          pathPoints[j + 1].x,
          pathPoints[j + 1].y,
          pathPoints[j + 1].z
        )
      }
    }

    lineGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )

    const lineMaterial = new THREE.LineBasicMaterial({
      color: theme === 'dark' ? '#3B82F6' : '#2563EB',
      opacity: 0.8,
      transparent: true,
    })

    linesRef.current = new THREE.LineSegments(lineGeometry, lineMaterial)
    globeRef.current.scene().add(linesRef.current)
  }, [currentSegment, points, theme])

  // Animation control with slower timing
  useEffect(() => {
    const PAUSE_DURATION = 3000 // 3 seconds pause at each point
    const SEGMENT_DURATION = 5000 // 5 seconds to draw each line

    let timeoutId: NodeJS.Timeout

    const animateNextSegment = () => {
      setCurrentSegment((prev) => {
        if (prev >= points.length - 1) {
          // Reset after a longer pause at the end
          timeoutId = setTimeout(() => {
            setCurrentSegment(-1)
            setActivePoint(null)
            // Start the animation again after resetting
            timeoutId = setTimeout(animateNextSegment, 3000)
          }, 5000)
          return prev
        }

        const nextIndex = prev + 1
        const point = points[nextIndex]
        setActivePoint(point)

        // Schedule next segment
        timeoutId = setTimeout(
          animateNextSegment,
          nextIndex < points.length - 1 ? SEGMENT_DURATION + PAUSE_DURATION : 0
        )

        return nextIndex
      })
    }

    // Start the animation
    timeoutId = setTimeout(animateNextSegment, 2000)

    return () => clearTimeout(timeoutId)
  }, [points])

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
      globeRef.current.controls().autoRotateSpeed = 0.3 // Slower rotation
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
        pointsData={points.slice(0, currentSegment + 1)}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => (theme === 'dark' ? '#3B82F6' : '#2563EB')}
        pointAltitude={0}
        pointRadius={0.2}
        pointsMerge={true}
        onPointClick={(point: object) => setActivePoint(point as GlobePoint)}
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
