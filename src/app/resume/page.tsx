import DynamicResume from '@/components/resume'
import { processResumeData } from '@/lib/utils'
import rawCvData from '@/data/cv.json'
import rawResumeData from '@/data/resume.json'

const { cv: cvData, resume: resumeData } = processResumeData(
  rawCvData,
  rawResumeData
)

export default function ResumePage() {
  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <DynamicResume cvData={cvData} resumeData={resumeData} />
    </section>
  )
}
