'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MDXImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
  className?: string
}

const MDXImage = ({
  src,
  alt = '',
  width,
  height,
  className,
}: MDXImageProps) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <div className="not-prose my-8">
        <div
          className="relative cursor-zoom-in overflow-hidden rounded-lg"
          onClick={() => setIsOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsOpen(true)
          }}
        >
          {isLoading && (
            <Skeleton className="absolute inset-0 h-full w-full rounded-lg" />
          )}
          <Image
            src={src}
            alt={alt}
            width={width || 1200}
            height={height || 630}
            className={cn(
              'w-full rounded-lg transition-opacity duration-300 hover:opacity-90',
              isLoading ? 'opacity-0' : 'opacity-100',
              className
            )}
            quality={90}
            onLoad={() => setIsLoading(false)}
          />
        </div>
        {alt && (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {alt}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[calc(100vh-4rem)] w-[calc(100vw-2rem)] max-w-screen-lg border-none bg-transparent p-0">
          <div className="relative flex h-full w-full items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-50 bg-background/80 hover:bg-background/90"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative h-full w-full overflow-auto p-4">
              <Image
                src={src}
                alt={alt}
                width={2400}
                height={1260}
                className="h-full w-full object-contain"
                quality={100}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MDXImage
