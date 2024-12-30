'use client'

import { motion, Transition, Variants } from 'framer-motion'
import React from 'react'

interface TextProps {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  transition?: Transition
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | number
  repeatDelay?: number
  className?: string
  onClick?: () => void
}

const BreathingText = ({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  transition = {
    duration: 1.5,
    ease: 'easeInOut',
  },
  staggerDuration = 0.1,
  staggerFrom = 'first',
  repeatDelay = 0.1,
  className,
  onClick,
  ...props
}: TextProps) => {
  const letterVariants: Variants = {
    initial: {
      fontVariationSettings: fromFontVariationSettings,
    },
    animate: (i) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: {
        ...transition,
        repeat: Infinity,
        repeatType: 'mirror',
        delay: i * staggerDuration,
        repeatDelay: repeatDelay,
      },
    }),
  }

  const getCustomIndex = (index: number, total: number) => {
    if (typeof staggerFrom === 'number') {
      return Math.abs(index - staggerFrom)
    }
    switch (staggerFrom) {
      case 'first':
        return index
      case 'last':
        return total - 1 - index
      case 'center':
      default:
        return Math.abs(index - Math.floor(total / 2))
    }
  }

  const letters = label.split('')

  return (
    <span className={`${className}`} onClick={onClick} {...props}>
      {letters.map((letter: string, i: number) => (
        <motion.span
          key={i}
          className="font-montserrat inline-block whitespace-pre"
          aria-hidden="true"
          variants={letterVariants}
          initial="initial"
          animate="animate"
          custom={getCustomIndex(i, letters.length)}
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
}

export default function Hero() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold sm:text-6xl">
        Hi, I&apos;m{' '}
        <BreathingText
          label="Michael DeMarco"
          staggerDuration={0.5}
          fromFontVariationSettings="'wght' 100, 'slnt' 0"
          toFontVariationSettings="'wght' 800, 'slnt' -10"
          className="text-primary"
          staggerFrom="first"
          transition={{
            duration: 5,
            ease: [0.4, 0, 0.6, 1],
          }}
        />
      </h1>
      <div className="space-y-4">
        {/* <p className="text-xl font-medium text-foreground">
          Software Engineer at{' '}
          <BreathingText
            label="Notion"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 700"
            className="text-primary"
            staggerFrom="first"
            staggerDuration={0.1}
          />
        </p> */}
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          I&apos;m passionate about building tools that empower people. I
          graduated from the University of British Columbia with a degree in
          Computer Science.
        </p>
      </div>
    </div>
  )
}
