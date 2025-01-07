'use client'

import { ChevronDown } from 'lucide-react'
import TypingHero from '@/components/hero'
import Logo from '@/components/logo'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import NewsletterForm from '@/components/newsletter-form'

export default function Home() {
  const [showChevron, setShowChevron] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowChevron(window.scrollY < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <section className="relative flex h-[calc(100vh-64px)] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[90vh] w-[90vh]">
            <Logo className="absolute inset-0 h-full w-full fill-foreground object-contain opacity-10 transition-opacity duration-200 dark:opacity-5" />
          </div>
        </div>
        <div className="container mx-auto flex h-full flex-col px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex flex-grow flex-col items-center justify-center text-center">
            <TypingHero />
          </div>
          <div className="relative z-10 mb-8 flex justify-center">
            <ChevronDown
              className={`h-6 w-6 animate-bounce text-muted-foreground transition-opacity duration-1000 ${
                showChevron ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="text-lg text-muted-foreground md:order-1">
            <p className="mb-2">
              I&apos;m a toolmaker, tinkerer, and teacher. This corner of the
              Internet is home to my{' '}
              <a href="/blog" className="text-primary hover:underline">
                writing
              </a>{' '}
              (on themes like technology,{' '}
              <a href="/travel" className="text-primary hover:underline">
                travel
              </a>
              , and education) and{' '}
              <a href="/design" className="text-primary hover:underline">
                portfolio
              </a>{' '}
              (of personal projects and design work). It&apos;s my digital
              sandbox that is for both play and profession.
            </p>
            <p className="mb-2">
              If you&apos;re interested in the play side, I recommend checking
              out the search function (via <code>CTRL + \</code> or the
              magnifying glass) or{' '}
              <a href="/sitemap" className="text-primary hover:underline">
                sitemap
              </a>{' '}
              and simply explore. If you&apos;re interested in the professional
              side, check out my{` `}
              <a href="/resume" className="text-primary hover:underline">
                resume
              </a>{' '}
              or{' '}
              <a href="/bio" className="text-primary hover:underline">
                bio
              </a>
              . If you&apos;d like to chat, you can grab a time slot{' '}
              <a
                href="https://calendar.notion.so/meet/mdemarco/k6xu04ld3"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>{' '}
              via Notion Calendar.
            </p>
            <p>Enjoy your stay!</p>
          </div>
          <div className="md:order-2">
            <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg md:w-full md:max-w-sm">
              <Image
                src="/images/me.jpg"
                alt="Michael DeMarco"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 384px"
                priority
              />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <NewsletterForm
              title="Subscribe to 'Busy Living'"
              description="Get notified when I write something new. Posts are always available on my blog."
            />
          </div>
        </div>
      </section>
    </>
  )
}
