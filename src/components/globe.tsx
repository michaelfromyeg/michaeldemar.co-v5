"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { TravelItinerary } from '@/lib/notion/types';

interface Arc {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
    animationStartTime: number;
    animationDuration: number;
}

interface GlobePoint {
    lat: number;
    lng: number;
    name: string;
    startDate: string;
    endDate: string;
    region: string;
    animationStartTime: number;
}

interface TravelGlobeProps {
    itineraries: TravelItinerary[];
}

export default function TravelGlobe({ itineraries }: TravelGlobeProps) {
    const globeRef = useRef<any>(null);
    const { theme } = useTheme();
    const [activePoint, setActivePoint] = useState<GlobePoint | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationRef = useRef<number>(0);

    // Convert itineraries to points with lat/lon and sort by date
    const points = useMemo(() => {
        const sortedItineraries = itineraries
            .filter(it => it.lat && it.lon)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        // Calculate total animation duration based on travel dates
        const firstDate = new Date(sortedItineraries[0]?.startDate || Date.now()).getTime();
        const lastDate = new Date(sortedItineraries[sortedItineraries.length - 1]?.endDate || Date.now()).getTime();
        const totalDuration = lastDate - firstDate;

        return sortedItineraries.map(it => ({
            lat: it.lat,
            lng: it.lon,
            name: it.title,
            startDate: it.startDate,
            endDate: it.endDate,
            region: it.region,
            animationStartTime: (new Date(it.startDate).getTime() - firstDate) / totalDuration
        }));
    }, [itineraries]);

    // Generate arcs between points considering time
    const arcs = useMemo(() => {
        const result: Arc[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const startTime = points[i].animationStartTime;
            const endTime = points[i + 1].animationStartTime;
            
            result.push({
                startLat: points[i].lat,
                startLng: points[i].lng,
                endLat: points[i + 1].lat,
                endLng: points[i + 1].lng,
                color: theme === 'dark' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(37, 99, 235, 0.6)',
                animationStartTime: startTime,
                animationDuration: endTime - startTime
            });
        }
        return result;
    }, [points, theme]);

    // Animation loop
    useEffect(() => {
        let startTime: number;
        
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / 20000; // 20-second total animation
            setAnimationProgress(progress % 1); // Loop animation
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Filter visible arcs and points based on animation progress
    const visibleArcs = arcs.filter(arc => 
        animationProgress >= arc.animationStartTime && 
        animationProgress <= arc.animationStartTime + arc.animationDuration
    );

    const visiblePoints = points.filter(point => 
        animationProgress >= point.animationStartTime
    );

    // Handle window resize
    useEffect(() => {
        function handleResize() {
            setDimensions({
                width: window.innerWidth > 1200 ? 1000 : window.innerWidth - 100,
                height: window.innerWidth > 1200 ? 600 : 400
            });
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-rotate and initial position
    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
            
            if (points.length > 0) {
                globeRef.current.pointOfView({
                    lat: points[0].lat,
                    lng: points[0].lng,
                    altitude: 2.5
                }, 1000);
            }
        }
    }, [points]);

    return (
        <div className="relative">
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl={theme === 'dark' 
                    ? "//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                }
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor={theme === 'dark' ? "#3B82F6" : "#2563EB"}
                atmosphereAltitude={0.1}
                arcsData={visibleArcs}
                arcColor="color"
                arcDashLength={0.9}
                arcDashGap={1}
                arcDashAnimateTime={2000}
                arcStroke={0.5}
                pointsData={visiblePoints}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => theme === 'dark' ? '#3B82F6' : '#2563EB'}
                pointAltitude={0.1}
                pointRadius={0.5}
                pointsMerge={true}
                onPointClick={(point: object) => setActivePoint(point as GlobePoint)}
                htmlElementsData={visiblePoints}
                htmlElement={(d: object) => {
                    const el = document.createElement('div');
                    el.innerHTML = `<div class="absolute px-2 py-1 text-xs font-semibold rounded-md bg-background/80 
                        backdrop-blur-sm border shadow-sm -translate-x-1/2 -translate-y-full pointer-events-none">
                        ${(d as GlobePoint).name}
                    </div>`;
                    return el;
                }}
            />
            {activePoint && (
                <Card className="absolute top-4 right-4 w-64">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{activePoint.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                            {activePoint.region}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            From: {new Date(activePoint.startDate).toLocaleDateString()}
                            <br />
                            To: {new Date(activePoint.endDate).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}