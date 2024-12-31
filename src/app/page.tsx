import { ChevronDown } from 'lucide-react'
import TypingHero from '@/components/hero'
import Logo from '@/components/logo'
import Image from 'next/image'

export default function Home() {
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
            <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 grid max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="text-lg text-muted-foreground md:order-1">
            <p className="mb-2">
              I&apos;m a toolmaker, tinkerer, and teacher. This corner of the
              Internet is home to my writing (on themes like technology, travel,
              and education) and portfolio (of personal projects and design
              work). It&apos;s a sandbox that is for play and profession.
            </p>
            <p>
              If you&apos;re interested in the play side, I recommend checking
              out the search function (CTRL + \) or sitemap and explore. If
              you&apos;re interested in the professional side, check out my
              resume or bio.
            </p>
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
      </section>
    </>
  )
}
