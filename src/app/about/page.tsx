import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About | Michael DeMarco',
  description:
    'Learn more about Michael DeMarco, a software engineer based in San Francisco.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <h1 className="mb-8 text-4xl font-bold">A little about me...</h1>
        <Card className="mb-8">
          <CardContent className="space-y-4 p-6">
            <p>
              Hey there! I&apos;m Michael, an Honours Computer Science graduate
              from{' '}
              <a
                href="https://ubc.ca"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                The University of British Columbia (UBC)
              </a>{' '}
              in Vancouver, Canada. I&apos;m originally from Edmonton, Alberta;
              I made the leap one province over to pursue my undergraduate
              studies in the fall of 2019. Alongside my major, I completed a{' '}
              <a
                href="https://datascience.ubc.ca/minor"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                minor in Data Science
              </a>{' '}
              and participated in the{' '}
              <a
                href="https://sciencecoop.ubc.ca"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                co-op program
              </a>
              . I also did a study abroad at the{' '}
              <a
                href="https://nus.edu.sg"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                National University of Singapore
              </a>
              .
            </p>
            <p>
              In college, I interned or worked at{' '}
              <a
                href="https://curo46.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                General Genomics
              </a>
              ,{' '}
              <a
                href="https://research.samsung.com/srca"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Samsung Electronics
              </a>{' '}
              in business-to-business (B2B) software,{' '}
              <a
                href="https://amazon.jobs/en/teams/scot"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Amazon
              </a>{' '}
              in &quot;Supply Chain Optimization Technologies&quot; or SCOT,{' '}
              <a
                href="https://tesla.com/supercharger"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Tesla
              </a>{' '}
              in Supercharging,{' '}
              <a
                href="https://asc-csa.gc.ca/eng"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                The Canadian Space Agency
              </a>{' '}
              on Canada&apos;s first-ever lunar rover, and as an{' '}
              <a
                href="https://cs.ubc.ca/ta/"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Undergraduate Teaching Assistant (UTA)
              </a>
              . I taught nine separate courses, including introductory
              programming in Python, introductory data science, computer
              systems, computer networking, data structures and algorithms, and
              parallel computing.
            </p>
            <p>
              Since graduating, I&apos;ve moved to San Francisco to complete a
              post-graduate internship at Notion.
            </p>
            <p>
              This blog is my sandbox on the Internet. It has been a passion
              project for a number of years. It showcases my writing, projects,
              design, and travel experiences.
            </p>
            <p>I hope you enjoy your stay. To wrap up, here are some photos.</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 place-items-center gap-8 md:grid-cols-2">
          <div className="space-y-2 text-center">
            <Image
              src="/images/me.jpg"
              alt="My headshot from my time at Notion."
              width={300}
              height={300}
              className="rounded-lg"
              priority
            />
            <p className="text-sm text-muted-foreground">
              My face! (July 2024)
            </p>
          </div>
          <div className="space-y-2 text-center">
            <Image
              src="/images/leo1.png"
              alt="A picture of my pet tortoise Leo."
              width={300}
              height={300}
              className="rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
              My pet tortoise Leo! (Jun 2020)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
