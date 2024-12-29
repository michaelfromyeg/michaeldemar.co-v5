import { ChevronDown } from 'lucide-react'
import DynamicResume from '@/components/resume'
import TypingHero from '@/components/hero'
import Logo from '@/components/logo'

import { processResumeData } from '@/lib/utils'
import rawCvData from '@/data/cv.json'
import rawResumeData from '@/data/resume.json'

const { cv: cvData, resume: resumeData } = processResumeData(
  rawCvData,
  rawResumeData
)

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
        <DynamicResume cvData={cvData} resumeData={resumeData} />
      </section>
    </>
  )
}
