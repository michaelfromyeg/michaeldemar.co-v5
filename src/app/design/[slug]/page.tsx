// src/app/design/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, Calendar, Edit2 } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import designData from "@/data/design.json";
import { ImageGallery } from "@/components/image-gallery";

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    return designData.projects.map((project) => ({
        slug: project.slug,
    }));
}

export async function generateMetadata(
    { params }: PageProps
): Promise<Metadata> {
    const project = designData.projectsBySlug[params.slug];

    if (!project) {
        return {
            title: "Project Not Found | Michael DeMarco",
            description: "The requested design project could not be found.",
        };
    }

    return {
        title: `${project.title} | Design | Michael DeMarco`,
        description: project.description || `Design case study for ${project.title}`,
    };
}

export default function DesignProjectPage({ params }: PageProps) {
    const project = designData.projectsBySlug[params.slug];

    if (!project) {
        notFound();
    }

    return (
        <article className="container mx-auto px-4 py-8 max-w-3xl">
            <Link
                href="/design"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
            >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to portfolio
            </Link>

            <header className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">{project.title}</h1>
                {project.description && (
                    <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
                )}
                <div className="flex items-center gap-4 text-muted-foreground">
                    {project.publishedDate && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(project.publishedDate)}
                        </div>
                    )}
                    {project.editedDate && project.editedDate !== project.createdDate && (
                        <div className="flex items-center gap-2">
                            <Edit2 className="h-4 w-4" />
                            Updated {formatDate(project.editedDate)}
                        </div>
                    )}
                </div>
            </header>

            {project.content && (
                <div className="prose prose-gray dark:prose-invert max-w-none mb-12">
                    <MDXRemote
                        source={project.content}
                        options={{
                            mdxOptions: {
                                remarkPlugins: [remarkGfm, remarkBreaks],
                                rehypePlugins: [rehypePrism, rehypeRaw],
                            },
                        }}
                    />
                </div>
            )}

            {project.images.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-8">Gallery</h2>
                    <ImageGallery images={project.images} />
                </div>
            )}
        </article>
    );
}