"use client";

import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Calendar, MapPin } from 'lucide-react';
import { ResumeEntryProps } from './types';

export function ResumeEntry({
    title,
    subtitle,
    location,
    startDate,
    endDate,
    highlightsHtml,
    tags,
    links,
}: ResumeEntryProps) {
    return (
        <Card className="group">
            <Collapsible>
                <CollapsibleTrigger className="w-full">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold">
                                    {title} @ <span className="italic">{subtitle}</span>
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {startDate} — {endDate || 'Present'}
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="mr-1 h-4 w-4" />
                                        {location}
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </div>
                    </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="px-6 pb-6 pt-0">
                        <ul className="list-disc space-y-2 pl-5">
                            {highlightsHtml.map((highlight, i) => (
                                <li key={i} className="text-muted-foreground">
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        {tags && tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {links && links.length > 0 && (
                            <div className="mt-4 flex gap-4 text-sm">
                                {links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
