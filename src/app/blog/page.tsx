import { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Calendar, Edit2 } from "lucide-react";
import Link from "next/link";
import blogData from "@/data/blog.json";

export const metadata: Metadata = {
    title: "Blog | Michael DeMarco",
    description: "Thoughts on software development, design, and life.",
};

export default function BlogPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
                <p className="text-lg text-muted-foreground">
                    My thoughts on software development, design, and life.
                </p>
            </div>

            <div className="grid gap-6">
                {blogData.posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                        <Card className="transition-colors hover:bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-2xl">{post.title}</CardTitle>
                                <CardDescription>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(post.createdDate)}
                                        {post.editedDate && (
                                            <>
                                                <Edit2 className="h-4 w-4 ml-2" />
                                                {formatDate(post.editedDate)}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{post.description}</p>
                            </CardContent>
                            <CardFooter>
                                <div className="flex items-center text-sm text-primary">
                                    Read more
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}