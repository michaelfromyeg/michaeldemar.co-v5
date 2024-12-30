'use client'

import React from 'react'

export default function Hero() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold sm:text-6xl">
        Hi, I&apos;m{' '}
        <span className="font-montserrat text-primary">Michael DeMarco</span>
      </h1>
      <div className="space-y-4">
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          I&apos;m passionate about building tools that empower people. I
          graduated from the University of British Columbia with a degree in
          Computer Science.
        </p>
      </div>
    </div>
  )
}
