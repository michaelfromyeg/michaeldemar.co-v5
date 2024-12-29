'use client'

import React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DesignImage } from '@/lib/notion/types'

interface ImageGalleryProps {
  images: DesignImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev === 0 ? images.length - 1 : (prev ?? 0) - 1
        )
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev === images.length - 1 ? 0 : (prev ?? 0) + 1
        )
      } else if (e.key === 'Escape') {
        setSelectedIndex(null)
      }
    },
    [selectedIndex, images.length]
  )

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null

  const handleImageClick = (index: number) => {
    setSelectedIndex(index)
  }

  const handleNavigation = (
    direction: 'prev' | 'next',
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    if (direction === 'prev') {
      setSelectedIndex((prev) =>
        prev === 0 || prev === null ? images.length - 1 : prev - 1
      )
    } else {
      setSelectedIndex((prev) =>
        prev === images.length - 1 || prev === null ? 0 : prev + 1
      )
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <motion.div
            key={image.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-square cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={image.url}
              alt={image.alt || 'Design image'}
              fill
              className="rounded-lg object-cover transition-transform group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute inset-0 flex items-end rounded-lg bg-black/60 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm text-white">{image.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 md:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 text-white transition-colors hover:text-gray-300"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>

            <button
              onClick={(e) => handleNavigation('prev', e)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white transition-colors hover:text-gray-300"
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Previous image</span>
            </button>

            <button
              onClick={(e) => handleNavigation('next', e)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white transition-colors hover:text-gray-300"
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Next image</span>
            </button>

            <div className="relative h-[80vh] w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt || 'Design image'}
                fill
                className="object-contain"
              />
            </div>

            {selectedImage.caption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-w-2xl text-center text-white"
              >
                <p>{selectedImage.caption}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
