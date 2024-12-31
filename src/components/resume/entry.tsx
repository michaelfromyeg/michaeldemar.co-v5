'use client'
import React from 'react'
import Image from 'next/image'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Calendar, MapPin } from 'lucide-react'
import { ResumeEntryProps } from './types'

export function ResumeEntry({
  title,
  subtitle,
  location,
  startDate,
  endDate,
  highlightsHtml,
  tags,
  links,
  logoPath,
}: ResumeEntryProps) {
  return (
    <Card className="group relative shadow-sm transition-shadow hover:shadow">
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 sm:space-y-1">
                  <div className="flex items-start">
                    <h3 className="text-left text-lg font-semibold leading-tight sm:text-xl">
                      {title} |{' '}
                      <span className="font-semibold">{subtitle}</span>
                    </h3>
                    {logoPath && (
                      <div className="ml-2 inline-flex items-center">
                        <Image
                          src={logoPath}
                          alt={`${subtitle} logo`}
                          width={0}
                          height={16}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            width: 'auto',
                            height: '16px',
                            objectFit: 'contain',
                          }}
                          className="mt-1 align-middle"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground sm:flex-row sm:space-x-4 sm:space-y-0">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4 shrink-0" />
                      <span>
                        {startDate}—{endDate || 'Present'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4 shrink-0" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="mt-2 h-5 w-5 self-center text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180 sm:mt-0 sm:self-start" />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
          <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
            <ul className="list-disc space-y-2 pl-4 sm:pl-6">
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
              <div className="mt-4 flex flex-wrap gap-2 text-sm sm:gap-4">
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
  )
}
