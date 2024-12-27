// src/components/image-gallery.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { DesignImage } from '@/lib/notion-design';

interface ImageGalleryProps {
    images: DesignImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = React.useState<DesignImage | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <motion.div
                        key={image.url}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative aspect-square cursor-pointer group"
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={image.url}
                            alt={image.alt || 'Design image'}
                            fill
                            className="object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        {image.caption && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-4">
                                <p className="text-white text-sm">{image.caption}</p>
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
                        className="fixed inset-0 bg-black/90 z-50 p-4 md:p-8 flex flex-col items-center justify-center"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close</span>
                        </button>

                        <div className="relative w-full h-[80vh]">
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
                                className="mt-4 text-white text-center max-w-2xl"
                            >
                                <p>{selectedImage.caption}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}