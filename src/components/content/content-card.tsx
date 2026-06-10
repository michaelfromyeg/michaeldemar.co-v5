import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn, formatDate } from '@/lib/utils'

export function TagList({
  tags,
  className,
}: {
  tags: string[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="tag">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

interface ContentCardProps {
  href: string
  title: string
  date: string
  description?: string
  tags?: string[]
  coverImage?: string | null
  coverBlurDataURL?: string | null
  coverAlt?: string
  ctaLabel: string
  /** Extra metadata rows rendered below the date (e.g. travel's region/duration). */
  meta?: ReactNode
}

export function ContentCard({
  href,
  title,
  date,
  description,
  tags,
  coverImage,
  coverBlurDataURL,
  coverAlt,
  ctaLabel,
  meta,
}: ContentCardProps) {
  return (
    <Link href={href}>
      <Card className="card-glow group h-full overflow-hidden pt-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={coverAlt ?? `Cover image for ${title}`}
              fill
              placeholder="blur"
              blurDataURL={coverBlurDataURL ?? ''}
              className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <ImageIcon className="text-muted-foreground h-12 w-12" />
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="group-hover:text-primary line-clamp-2 text-lg transition-colors duration-200">
            {title}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(date)}
              </div>
              {meta}
            </div>
            {tags && tags.length > 0 && (
              <TagList tags={tags} className="mt-2" />
            )}
          </CardDescription>
        </CardHeader>
        {description && (
          <CardContent>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {description}
            </p>
          </CardContent>
        )}
        <CardFooter className="mt-auto justify-end">
          <div className="text-primary flex items-center text-sm">
            {ctaLabel}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

interface FeaturedCardProps {
  href: string
  label: string
  title: string
  date: string
  description: string
  tags?: string[]
  coverImage?: string | null
  coverBlurDataURL?: string | null
  coverAlt?: string
  ctaLabel: string
}

export function FeaturedCard({
  href,
  label,
  title,
  date,
  description,
  tags,
  coverImage,
  coverBlurDataURL,
  coverAlt,
  ctaLabel,
}: FeaturedCardProps) {
  return (
    <Link href={href}>
      <Card className="card-glow group mb-12 overflow-hidden py-0 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative h-64 md:h-full">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={coverAlt ?? `Cover image for ${title}`}
                fill
                placeholder="blur"
                blurDataURL={coverBlurDataURL ?? ''}
                className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
              />
            ) : (
              <div className="bg-muted flex h-full w-full items-center justify-center">
                <ImageIcon className="text-muted-foreground h-16 w-16" />
              </div>
            )}
          </div>
          <div className="flex flex-col p-6">
            <div className="mb-4">
              <span className="bg-primary/10 text-primary mb-2 inline-block rounded-full px-3 py-1 text-sm font-medium">
                {label}
              </span>
            </div>
            <h2 className="group-hover:text-primary mb-4 text-2xl font-bold tracking-tight transition-colors duration-200">
              {title}
            </h2>
            <div className="text-muted-foreground mb-4 flex items-center text-sm">
              <Calendar className="mr-1.5 h-4 w-4" />
              {formatDate(date)}
            </div>
            {tags && tags.length > 0 && (
              <TagList tags={tags} className="mb-4" />
            )}
            <p className="text-muted-foreground mb-6 flex-1">{description}</p>
            <div className="mt-auto">
              <div className="text-primary flex items-center">
                {ctaLabel}
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function CardGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}
