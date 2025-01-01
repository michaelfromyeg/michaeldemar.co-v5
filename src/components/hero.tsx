'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <div className="space-y-6">
      <motion.h1
        className="text-4xl font-bold sm:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Hi, I&apos;m{' '}
        <motion.span
          className="font-montserrat text-primary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          Michael DeMarco
        </motion.span>
      </motion.h1>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      >
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Welcome to my over-engineered corner of the Internet.
        </p>
      </motion.div>
    </div>
  )
}
