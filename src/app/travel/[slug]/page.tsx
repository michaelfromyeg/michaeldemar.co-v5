import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import travelData from "@/data/travel.json";

import "./travel.css";

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    return travelData.itineraries.map((itinerary) => ({
        slug: itinerary.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const itinerary = travelData.itinerariesBySlug[params.slug];

    if (!itinerary) {
        return {
            title: "Itinerary Not Found | Michael DeMarco",
        };
    }

    return {
        title: `${itinerary.title} | Travel | Michael DeMarco`,
        description: itinerary.description,
    };
}

export default async function TravelPage({ params }: PageProps) {
    const itinerary = travelData.itinerariesBySlug[params.slug];

    if (!itinerary) {
        notFound();
    }

    return (
        <article className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-muted/50 border-b">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <Link
                        href="/travel"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to travel
                    </Link>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {itinerary.region}
                        </div>
                        
                        <h1 className="text-4xl font-bold tracking-tight">
                            {itinerary.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(itinerary.startDate)}
                                {" - "}
                                {formatDate(itinerary.endDate)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {itinerary.duration} days
                            </div>
                        </div>

                        <p className="text-lg max-w-2xl">
                            {itinerary.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Quick Facts Card */}
                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle>Quick Facts</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                Duration
                            </div>
                            <div>{itinerary.duration} days</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                Region
                            </div>
                            <div>{itinerary.region}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                                Status
                            </div>
                            <div>
                                {itinerary.isDone ? "Completed" : "Planned"}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Itinerary Content */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <MDXRemote
                        source={itinerary.content ?? ""}
                        options={{
                            mdxOptions: {
                                remarkPlugins: [remarkGfm, remarkBreaks],
                                rehypePlugins: [rehypePrism, rehypeRaw],
                            },
                        }}
                    />
                </div>
            </div>
        </article>
    );
}