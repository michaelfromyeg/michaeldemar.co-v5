"use client";

import React from 'react';
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Github } from "lucide-react";

interface GiscusConfig {
    id: string;
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: string;
    lang: string;
    loading: string;
    strict: string;
}

interface CommentsProps {
    slug: string;
    title: string;
}

export function Comments({ slug, title }: CommentsProps) {
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [discussionExists, setDiscussionExists] = React.useState<boolean | null>(null);

    const loadGiscus = React.useCallback(() => {
        // Clean up any existing Giscus container
        const existingScript = document.querySelector('script[src*="giscus"]');
        const giscusContainer = document.querySelector('.giscus');
        if (existingScript) existingScript.remove();
        if (giscusContainer) giscusContainer.remove();

        try {
            const script = document.createElement('script');
            script.src = 'https://giscus.app/client.js';

            // Debug log
            console.log('Current pathname:', window.location.pathname);

            // Core giscus attributes
            script.setAttribute('data-repo', process.env.NEXT_PUBLIC_GISCUS_REPO!);
            script.setAttribute('data-repo-id', process.env.NEXT_PUBLIC_GISCUS_REPO_ID!);
            script.setAttribute('data-category', 'General');
            script.setAttribute('data-category-id', process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!);
            script.setAttribute('data-mapping', 'pathname');
            script.setAttribute('data-strict', '0');
            script.setAttribute('data-reactions-enabled', '1');
            script.setAttribute('data-emit-metadata', '1');
            script.setAttribute('data-input-position', 'bottom');
            script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
            script.setAttribute('data-lang', 'en');
            script.crossOrigin = 'anonymous';
            script.async = true;

            // Listen for messages from giscus iframe
            window.addEventListener('message', function handleMessage(event) {
                if (event.origin !== 'https://giscus.app') return;

                // Debug log
                console.log('Received message from giscus:', event.data);

                if (event.data?.giscus?.discussion) {
                    console.log('Discussion found:', event.data.giscus.discussion);
                    setDiscussionExists(true);
                    setIsLoading(false);
                    window.removeEventListener('message', handleMessage);
                } else if (event.data?.giscus?.error === 'Discussion not found') {
                    console.log('Discussion not found');
                    setDiscussionExists(false);
                    setIsLoading(false);
                    window.removeEventListener('message', handleMessage);
                }
            });

            const commentsContainer = document.getElementById('comments');
            if (commentsContainer) {
                commentsContainer.appendChild(script);
            }
        } catch (err) {
            console.error('Error loading Giscus:', err);
            setError('Failed to initialize comments. Please check your configuration.');
            setIsLoading(false);
        }
    }, [theme]);

    React.useEffect(() => {
        loadGiscus();
    }, [loadGiscus]);

    const createDiscussion = () => {
        const repoName = process.env.NEXT_PUBLIC_GISCUS_REPO;
        const discussionTitle = `Comments for: ${title}`;
        const discussionBody = `This is the discussion for blog post: ${window.location.href}`;
        const newDiscussionUrl = `https://github.com/${repoName}/discussions/new?category=General&title=${encodeURIComponent(discussionTitle)}&body=${encodeURIComponent(discussionBody)}`;
        window.open(newDiscussionUrl, '_blank');
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && !discussionExists && (
                    <div className="flex flex-col items-center py-8 gap-4">
                        <p className="text-muted-foreground text-center">
                            No discussion exists yet for this post.
                        </p>
                        <Button
                            onClick={createDiscussion}
                            className="flex items-center gap-2"
                        >
                            <Github className="h-4 w-4" />
                            Create Discussion
                        </Button>
                    </div>
                )}

                <div id="comments" className="giscus" />
            </CardContent>
        </Card>
    );
}

export default Comments;