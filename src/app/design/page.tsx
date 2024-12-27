// src/app/design/page.tsx
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import designData from "@/data/design.json";

export const metadata: Metadata = {
    title: "Design | Michael DeMarco",
    description: "My design portfolio and case studies.",
};

export default function DesignPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Design Portfolio</h1>
                <p className="text-lg text-muted-foreground">
                    A collection of my design work, case studies, and experiments.
                </p>
            </div>

            <div className="grid gap-8">
                {designData.projects.map((project) => (
                    <Link key={project.id} href={`/design/${project.slug}`}>
                        <Card className="transition-colors hover:bg-muted/50 overflow-hidden group">
                            {project.images[0] ? (
                                <div className="relative w-full h-64">
                                    <Image
                                        src={project.images[0].url}
                                        alt={project.images[0].alt || project.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-64 bg-muted flex items-center justify-center">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{project.title}</CardTitle>
                                <CardDescription>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4" />
                                        {project.publishedDate ? 
                                            formatDate(project.publishedDate) : 
                                            formatDate(project.createdDate)
                                        }
                                    </div>
                                    {project.description && (
                                        <p className="text-muted-foreground">{project.description}</p>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm">
                                    <span className="text-primary mr-2">View project</span>
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {designData.projects.length === 0 && (
                <Card className="p-8 text-center">
                    <CardContent>
                        <p className="text-muted-foreground">No design projects found.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}