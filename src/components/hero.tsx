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
          Welcome to my over-engineered corner of the Internet.
        </p>
      </div>
    </div>
  )
}
