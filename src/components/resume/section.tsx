// components/DynamicResume/section.tsx
import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ResumeSectionProps {
    title: string;
    icon: LucideIcon;
    linkHref?: string;
    linkText?: string;
    children: React.ReactNode;
}

export function ResumeSection({ title, icon: Icon, linkHref, linkText, children }: ResumeSectionProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Icon className="h-8 w-8" />
                    {title}
                </h2>
                {linkHref && linkText && (
                    <p className="text-muted-foreground">
                        {linkText}{' '}
                        <Link href={linkHref} className="text-primary hover:underline">
                            here
                        </Link>
                        .
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
